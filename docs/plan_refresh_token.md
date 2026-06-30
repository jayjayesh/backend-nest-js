# Plan: Add a Refresh Token Feature

This guide walks you — step by step — through adding **refresh tokens** to the
auth system. It is written for a complete beginner: every step says *which file*
to touch, *what code* to add, and *why*.

You will implement it yourself. Do the steps in order and test after each major
one (there is a "How to test" section at the end).

---

## 1. What problem are we solving?

Right now, sign-in returns a single **access token** that expires in
**900 seconds (15 minutes)** — see [auth.module.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/auth.module.ts) (`expiresIn: 900`).

When it expires, the user would have to log in again (re-enter email +
password). That's annoying.

The fix is to issue **two** tokens at login:

| Token | Lifetime | Job |
|-------|----------|-----|
| **Access token** | short (15 min) | Sent on every protected request. |
| **Refresh token** | long (e.g. 7 days) | Used *only* to get a new access token when the old one expires. |

Flow when the access token expires:

```
Client → POST /auth/refresh  (sends the refresh token)
Server → verifies refresh token → returns a NEW access token (+ new refresh token)
```

So the user stays logged in for up to 7 days without re-entering a password.

> [!NOTE]
> **This plan uses the simplest approach: a stateless refresh token.**
> The server does NOT store refresh tokens in the database — it just verifies
> the token's signature. This is the least code. Its one limitation: you cannot
> force-logout a stolen token before it expires.
> A later **optional** section ("Make it revocable") shows how to upgrade to
> database-stored refresh tokens if you want logout / revocation.

---

## 2. The key idea: two secrets

A JWT is "signed" with a secret string. We will sign:

- the **access token** with `JWT_SECRET` (already exists), and
- the **refresh token** with a **new, different** secret `JWT_REFRESH_SECRET`.

Using two different secrets means a refresh token can never be accepted as an
access token, and vice-versa. That keeps them separated and safe.

---

## Step-by-step

### Step 1 — Add the new secret to your env files

Open [.env](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/.env)
and add a line (use a long random string, different from `JWT_SECRET`):

```
JWT_REFRESH_SECRET="some-very-long-random-string-different-from-jwt-secret"
```

Do the same in [.env.test](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/.env.test)
so the e2e tests have it too:

```
JWT_REFRESH_SECRET="test-refresh-secret"
```

Why: the refresh token needs its own secret to be signed and verified.

### Step 2 — Update `signToken` to also create a refresh token

Open [auth.service.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/auth.service.ts).

Currently `signToken` returns only `{ access_token }`. Change it to return both
tokens. The refresh token is signed with the refresh secret and a longer expiry:

```ts
async signToken(userId: string, email: string) {
  const payload = { sub: userId, email };

  const access_token = await this.jwt.signAsync(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: 900, // 15 minutes (same as before)
  });

  const refresh_token = await this.jwt.signAsync(payload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d', // 7 days
  });

  return { access_token, refresh_token };
}
```

> Note: We now pass `secret` and `expiresIn` explicitly to `signAsync` instead of
> relying on the defaults in `JwtModule.register`. This lets one `JwtService`
> sign both kinds of token. The old default (`expiresIn: 900` in the module) can
> stay; it just won't be used by these explicit calls.

Because `signIn` and `signUp` already `return this.signToken(...)`, they will now
automatically return both tokens. No change needed in those two methods.

### Step 3 — Add a `refreshTokens` method to the service

Still in [auth.service.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/auth.service.ts),
add a new method. It verifies the incoming refresh token and, if valid, issues a
fresh pair of tokens:

```ts
async refreshTokens(refreshToken: string) {
  try {
    // Verify the refresh token's signature + expiry using the REFRESH secret
    const payload = await this.jwt.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // payload.sub = userId, payload.email = email (set in signToken)
    return this.signToken(payload.sub, payload.email);
  } catch {
    throw new ForbiddenException('Invalid or expired refresh token');
  }
}
```

`ForbiddenException` is already imported at the top of this file — good.

Why the `try/catch`: `verifyAsync` throws if the token is fake, tampered, or
expired. We turn that into a clean `403` response.

### Step 4 — Create a DTO for the refresh request

The client will send the refresh token in the request body. Create a small DTO so
it gets validated.

Create a new file: `src/auth/dto/refresh.dto.ts`

```ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The refresh token received at login' })
  refresh_token!: string;
}
```

Then export it from [dto/index.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/dto/index.ts):

```ts
export * from './refresh.dto';
```

### Step 5 — Add the `/auth/refresh` endpoint

Open [auth.controller.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/auth/auth.controller.ts).

- Add `RefreshDto` to the `./dto` import.
- Add this new route (returns `200`, like sign-in):

```ts
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Get a new access token using a refresh token' })
@ApiOkResponse({ description: 'Returns a new access + refresh token pair' })
@ApiForbiddenResponse({ description: '403 : invalid or expired refresh token' })
@Post('refresh')
refresh(@Body() body: RefreshDto) {
  return this.authService.refreshTokens(body.refresh_token);
}
```

`@HttpCode`, `@ApiOperation`, `@ApiOkResponse`, `@ApiForbiddenResponse`, `Post`,
and `Body` are all already imported in this file — nothing new to import there.

### Step 6 — That's the whole feature 🎉

You did NOT need to touch the database, the Prisma schema, the JWT strategy, or
the guard. Sign-in / sign-up now return both tokens, and `/auth/refresh` swaps a
valid refresh token for a new pair.

---

## How to test

### In Swagger / by hand
1. `POST /auth/sign-in` → response `data` now contains `access_token` **and**
   `refresh_token`.
2. `POST /auth/refresh` with body `{ "refresh_token": "<paste it>" }` → you get a
   new pair back.
3. `POST /auth/refresh` with a garbage token → `403`.

### In the e2e tests
Open [app.e2e-spec.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/test/app.e2e-spec.ts):

- In the "should signin" test, also store the refresh token:
  ```ts
  .stores('userRt', 'data.refresh_token')
  ```
- Add a new `describe('Refresh')` block:
  ```ts
  it('should refresh tokens', () => {
    return pactum
      .spec()
      .post('/auth/refresh')
      .withBody({ refresh_token: '$S{userRt}' })
      .expectStatus(200);
  });

  it('should reject a bad refresh token', () => {
    return pactum
      .spec()
      .post('/auth/refresh')
      .withBody({ refresh_token: 'not-a-real-token' })
      .expectStatus(403);
  });
  ```

---

## Optional upgrade: make refresh tokens revocable (more secure)

The simple version above cannot "log out" a refresh token early. If you want
real logout / revocation later, do this **after** the basic version works:

1. **Schema** — add a field to the `User` model in
   [schema.prisma](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/prisma/schema.prisma):
   ```prisma
   hashedRefreshToken String?
   ```
   Then run a migration: `npx prisma migrate dev --name add_refresh_token`.
2. **On login / refresh** — after creating the refresh token, hash it with argon
   and save it: `prisma.user.update({ where: { id }, data: { hashedRefreshToken } })`.
3. **On `/auth/refresh`** — after verifying the JWT, also load the user and
   `argon.verify(user.hashedRefreshToken, incomingToken)`. If it doesn't match,
   reject. (This is called *token rotation* when you also replace the stored hash
   each refresh.)
4. **Add `/auth/logout`** — set `hashedRefreshToken` back to `null`, which
   instantly invalidates the user's refresh token.

This is more code and a DB migration, so only do it if you need server-side
logout. The simple version is enough to learn the concept and keep users
logged in.

---

## Why this plan stays simple

- No new dependencies — uses the `@nestjs/jwt` `JwtService` you already have.
- No database changes in the main path.
- No new Passport strategy or guard — refresh verification is one
  `jwt.verifyAsync` call in the service.
