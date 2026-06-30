# Swagger (OpenAPI) Learning Plan — NestJS

A step-by-step path to learn `@nestjs/swagger` in this project.
Check a box (`[x]`) when a step is done. Ask **"what's next?"** anytime and
I'll point you to the first unchecked step.

> How to read this: each step has a **Goal**, the **File(s)** to touch, and a
> **Done when** you can verify it. Do them in order — later steps build on earlier ones.

---

## Phase 0 — Foundation (done ✅)

- [x] Install `@nestjs/swagger` and wire it up
- [x] Build the doc config with `DocumentBuilder` in `src/main.ts`
- [x] Add `.addBearerAuth()` so protected routes can be tested
- [x] Mount Swagger UI at `/api` with `persistAuthorization: true`
- [x] Add `@ApiProperty` to `AuthDto` (`src/auth/dto/auth.dto.ts`)

**Verify Phase 0:** run `npm run start:dev`, open http://localhost:3000/api —
you should see the interactive UI with the `auth` endpoints.

---

## Phase 1 — Document your DTOs

Goal: every request body shows correct fields, types, and examples in Swagger.

- [x] **1.1** Add `@ApiProperty` to every field in `CreateBookmarkDto`
  - File: `src/bookmarks/dto/create_bookmark.dto.ts`
  - Done when: the create-bookmark request schema shows each field + example.
- [x] **1.2** Use `@ApiPropertyOptional` for optional fields in `EditBookmarkDto`
  - File: `src/bookmarks/dto/edit_bookmark.dto.ts`
  - Done when: optional fields are **not** marked required (no red asterisk).
- [x] **1.3** Document `EditUserDto`
  - File: `src/users/dto/edit_user.dto.ts`
  - Done when: each field has a description/example; optionals use the optional decorator.
- [x] **1.4** Learn `description`, `default`, and `enum` options on `@ApiProperty`
  - Done when: at least one field uses a `description` and one uses `enum` or `default`.

**Concept check:** What's the difference between `@ApiProperty({ required: false })`
and `@ApiPropertyOptional()`? (They're equivalent — the second is shorthand.)

---

## Phase 2 — Group & describe your endpoints

Goal: the UI is organized and each route is self-explanatory.

- [x] **2.1** Add `@ApiTags('auth')` to `AuthController`
  - File: `src/auth/auth.controller.ts`
- [x] **2.2** Add `@ApiTags('users')` to `UsersController`
  - File: `src/users/users.controller.ts`
- [x] **2.3** Add `@ApiTags('bookmarks')` to `BookmarksController`
  - File: `src/bookmarks/bookmarks.controller.ts`
  - Done when: routes are grouped under three collapsible sections in `/api`.
- [x] **2.4** Add `@ApiOperation({ summary: '...' })` to each route handler
  - Done when: every endpoint has a one-line human summary in the UI.

---

## Phase 3 — Protected routes & auth

Goal: secured endpoints show a lock and accept your JWT in the UI.

- [x] **3.1** Add `@ApiBearerAuth()` to routes guarded by your JWT guard
  - Likely files: `users.controller.ts`, `bookmarks.controller.ts`
  - Done when: those routes show a 🔒 and respect the "Authorize" token.
- [x] **3.2** Test the full flow in the UI: sign up → sign in → copy token →
      click **Authorize** → call a protected route successfully.
  - Done when: a protected GET returns 200 using only the Swagger UI.

---

## Phase 4 — Document responses

Goal: consumers know what each endpoint returns and which errors to expect.

- [x] **4.1** Add `@ApiResponse` (or `@ApiOkResponse` / `@ApiCreatedResponse`)
      to a few key routes
- [x] **4.2** Document error responses: `@ApiUnauthorizedResponse`,
      `@ApiForbiddenResponse`, `@ApiNotFoundResponse`
- [x] **4.3** Create response DTO classes (e.g. `UserResponseDto`) and reference
      them with `@ApiResponse({ type: UserResponseDto })` so the schema is shown
  - Done when: at least one endpoint shows a typed 200 **and** an error response.

---

## Phase 5 — Polish & advanced

Goal: a clean, professional, shareable API doc.

- [ ] **5.1** Document path/query params with `@ApiParam` and `@ApiQuery`
- [ ] **5.2** Try the CLI plugin to auto-infer `@ApiProperty` from types
      (configure `plugins: ['@nestjs/swagger']` in `nest-cli.json`) and observe
      what it generates for free
- [ ] **5.3** Export the OpenAPI JSON (the `document` object) and skim the spec
- [ ] **5.4** (Optional) Version the API or split docs with multiple
      `SwaggerModule.setup` mounts

**Verify Phase 5:** a teammate could understand and call every endpoint using
only `/api`, with no extra explanation from you.

---

## Quick reference — decorators you'll use

| Decorator                               | Where               | Purpose                          |
| --------------------------------------- | ------------------- | -------------------------------- |
| `@ApiTags`                              | controller class    | Group endpoints into sections    |
| `@ApiOperation`                         | route method        | One-line summary/description     |
| `@ApiProperty` / `@ApiPropertyOptional` | DTO field           | Describe request/response fields |
| `@ApiBearerAuth`                        | controller or route | Mark route as needing the JWT    |
| `@ApiResponse` & friends                | route method        | Document status codes + shapes   |
| `@ApiParam` / `@ApiQuery`               | route method        | Describe path/query params       |

---

### Progress log (optional)

Jot a date + note when you finish a phase:

- _Phase 0 — done (Swagger set up, AuthDto documented)_
