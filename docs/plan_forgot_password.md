# Plan: Add a Forgot / Reset Password Feature

This guide walks you — step by step — through adding a **forgot password** flow
to the auth system. It is written for a complete beginner: every step says
*which file* to touch, *what code* to add, and *why*.

Do the steps in order and test after each major one (see "How to test" at the end).

---

## 1. What problem are we solving?

If a user forgets their password, today they have no way to get back in. The
standard fix is a two-step flow:

| Step | Endpoint | What happens |
|------|----------|--------------|
| 1. Request a reset | `POST /auth/forgot-password` | User sends their email. Server creates a short-lived **reset token** and emails them a link. |
| 2. Set a new password | `POST /auth/reset-password` | User sends the token + a new password. Server verifies the token and saves the new password. |

```
Forgot:  Client → POST /auth/forgot-password { email }
                  Server → makes a reset token → "emails" it to the user
Reset:   Client → POST /auth/reset-password { token, password }
                  Server → verifies token → hashes & saves new password
```

> [!NOTE]
> **This plan uses the simplest approach: a stateless reset token (a JWT).**
> The server does NOT store the reset token in the database — it just verifies
> the token's signature and expiry. This is the least code and needs no
> migration.
>
> **Sending a real email** also needs an email provider, which is extra setup.
> So in the main path we **log the reset link to the console** (good enough to
> learn and test). Real email + database-stored single-use tokens are covered in
> the **optional** section at the end.

---

## 2. The key idea: a dedicated reset secret

Just like the access and refresh tokens use different secrets, the reset token
gets its **own** secret `JWT_RESET_SECRET`. This keeps a reset token from ever
being accepted as a login token. The token is short-lived (e.g. **15 minutes**)
because a password-reset link should expire quickly.

---

## Step-by-step

### Step 1 — Add the new secret to your env files

Open [.env](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/.env)
and add a long random string (different from the other secrets):

```
JWT_RESET_SECRET="another-very-long-random-string-just-for-resets"
```

Do the same in [.env.test](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/.env.test):

```
JWT_RESET_SECRET="test-reset-secret"
```

Why: the reset token needs its own secret to be signed and verified.

### Step 2 — Create the two DTOs

The client sends an email (to request a reset) and later a token + new password.
Each gets a small validated DTO.

Create `src/auth/dto/forgot_password.dto.ts`:

```ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'test@email.com' })
  email!: string;
}
```

Create `src/auth/dto/reset_password.dto.ts`:

```ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The reset token from the email link' })
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ example: 'myNewPassword123' })
  password!: string;
}
```

Then export both from [dto/index.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/dto/index.ts):

```ts
export * from './forgot_password.dto';
export * from './reset_password.dto';
```

### Step 3 — Add `forgotPassword` to the service

Open [auth.service.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/auth.service.ts)
and add this method:

```ts
async forgotPassword(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });

  // SECURITY: only act if the user exists, but ALWAYS return the same message
  // (so attackers can't discover which emails are registered).
  if (user) {
    const resetToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_RESET_SECRET, expiresIn: '15m' },
    );

    // In a real app you'd email this link. For now, log it so you can test.
    const resetLink = `http://localhost:3333/reset-password?token=${resetToken}`;
    console.log('PASSWORD RESET LINK:', resetLink);
  }

  return { message: 'If that email exists, a reset link has been sent.' };
}
```

Why return the same message either way: this prevents "email enumeration" — an
attacker submitting many emails to learn which ones have accounts.

### Step 4 — Add `resetPassword` to the service

Still in [auth.service.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/auth.service.ts),
add:

```ts
async resetPassword(token: string, newPassword: string) {
  let payload: { sub: string; email: string };
  try {
    // Verify the reset token using the RESET secret
    payload = await this.jwt.verifyAsync(token, {
      secret: process.env.JWT_RESET_SECRET,
    });
  } catch {
    throw new ForbiddenException('Invalid or expired reset token');
  }

  // Hash the new password and save it
  const hash = await argon.hash(newPassword);
  await this.prisma.user.update({
    where: { id: payload.sub },
    data: { password: hash },
  });

  return { message: 'Password has been reset successfully.' };
}
```

Good news: `argon`, `ForbiddenException`, `this.jwt`, and `this.prisma` are all
already imported / available in this file. Nothing new to import.

Why hash: passwords are never stored in plain text — `argon.hash` is the same
function used in `signUp`.

### Step 5 — Add the two endpoints

Open [auth.controller.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/auth.controller.ts).

- Add `ForgotPasswordDto, ResetPasswordDto` to the `./dto` import.
- Add these two routes (both return `200`):

```ts
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Request a password reset link' })
@ApiOkResponse({ description: 'Always returns a generic success message' })
@Post('forgot-password')
forgotPassword(@Body() body: ForgotPasswordDto) {
  return this.authService.forgotPassword(body.email);
}

@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Set a new password using a reset token' })
@ApiOkResponse({ description: 'Password reset successfully' })
@ApiForbiddenResponse({ description: '403 : invalid or expired reset token' })
@Post('reset-password')
resetPassword(@Body() body: ResetPasswordDto) {
  return this.authService.resetPassword(body.token, body.password);
}
```

`@HttpCode`, `@Post`, `@Body`, `@ApiOperation`, `@ApiOkResponse`, and
`@ApiForbiddenResponse` are already imported in this file.

### Step 6 — Done 🎉

No database migration, no email provider, no new strategy or guard. You can now
request a reset, copy the link from the server console, and set a new password.

---

## How to test

### By hand (with the app running)
1. `POST /auth/forgot-password` with `{ "email": "valid@email.com" }`
   → response is the generic message, and the **reset link is printed in your
   terminal**. Copy the `token` from that link.
2. `POST /auth/reset-password` with `{ "token": "<paste>", "password": "newpass123" }`
   → success message.
3. `POST /auth/sign-in` with the **new** password → works. Old password → `403`.
4. `POST /auth/reset-password` with a garbage token → `403`.

### In the e2e tests
Open [app.e2e-spec.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/test/app.e2e-spec.ts)
and add a `describe('Forgot password')` block. Because the token is only logged
(not returned), the easiest things to assert are:

```ts
it('forgot-password returns 200 for any email', () => {
  return pactum
    .spec()
    .post('/auth/forgot-password')
    .withBody({ email: 'valid@email.com' })
    .expectStatus(200);
});

it('reset-password rejects a bad token', () => {
  return pactum
    .spec()
    .post('/auth/reset-password')
    .withBody({ token: 'not-a-real-token', password: 'whatever123' })
    .expectStatus(403);
});
```

> To e2e-test the full happy path, you'd need the service to *return* the token
> in test mode, or to read it from the DB (see the optional section). For now,
> verifying the happy path by hand is fine.

---

## Optional upgrades (do these later, only if you need them)

These make the feature production-grade. Skip them while learning.

### A. Send a real email
1. `npm install nodemailer` (or use a provider SDK like SendGrid/Resend).
2. Create a tiny `MailService` that sends the reset link.
3. Replace the `console.log` in `forgotPassword` with a call to that service.

### B. Single-use, database-stored tokens (more secure)
A stateless JWT stays valid until it expires, even after it's been used. To make
a reset link usable **only once** and revocable:
1. Add fields to the `User` model in
   [schema.prisma](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/prisma/schema.prisma):
   ```prisma
   hashedResetToken   String?
   resetTokenExpiry   DateTime?
   ```
   Then `npx prisma migrate dev --name add_reset_token`.
2. In `forgotPassword`: hash the token with argon and save it + an expiry.
3. In `resetPassword`: after verifying the JWT, also `argon.verify` against the
   stored hash and check it hasn't expired; then **clear** both fields so the
   link can't be reused.

---

## Why this plan stays simple

- No new dependencies in the main path — reuses `@nestjs/jwt` and `argon2`.
- No database migration.
- No email provider setup (the link is logged for now).
- No new Passport strategy or guard.
