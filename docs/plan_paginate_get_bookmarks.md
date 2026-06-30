# Plan: Add Pagination to `getBookmarks`

This plan details how to add **offset-based pagination** (page + limit) to the
"get all bookmarks" endpoint, so the API returns one page of results at a time
instead of every bookmark at once.

You will implement it yourself — each step below is small and can be tested
before moving to the next.

## Background concept

There are two common pagination styles:

1. **Offset-based** (`page` + `limit`) — "give me page 2, 10 per page". The
   database `SKIP`s the first `(page-1)*limit` rows and `TAKE`s `limit` rows.
   Simple, easy to build a "page 1 / 2 / 3" UI. This is what we use.
2. **Cursor-based** — "give me the 10 rows after id X". More efficient on very
   large tables, but more complex. **Not needed here** — skip it for now.

The current endpoint returns:

```json
{ "data": { "items": [ ...all bookmarks... ] } }
```

After this change it returns one page plus metadata:

```json
{
  "data": {
    "items": [ ...up to `limit` bookmarks... ],
    "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
  }
}
```

> Note: `data` stays a Map (object), which keeps the response contract
> introduced earlier — see [the consistent-response plan](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/docs/plan_modularize_consistant_api_response.md).

---

## Decisions (already made)

> [!NOTE]
> - **Invalid params** (e.g. `page=abc`, `limit=0`) → return `400` automatically
>   via the global `ValidationPipe`.
> - **No max cap** on `limit` — any positive integer is allowed.
> - **Defaults**: `page=1`, `limit=10` when the client omits them.

---

## Step-by-step

### Step 1 — Create the query DTO

Create a new file: `src/bookmarks/dto/pagination_query.dto.ts`

It defines the two query params, their defaults, and their validation rules.

```ts
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number) // query params arrive as strings; coerce to number
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
```

Why `@Type(() => Number)`: query string values are always strings (`"2"`), so
without coercion `@IsInt()` would always fail. This works because the global
`ValidationPipe` is already enabled in [main.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/main.ts).

### Step 2 — Export the DTO

In `src/bookmarks/dto/index.ts`, add:

```ts
export * from './pagination_query.dto';
```

### Step 3 — Update the controller

In [bookmarks.controller.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/bookmarks/bookmarks.controller.ts):

- Add `Query` to the `@nestjs/common` import.
- Add `PaginationQueryDto` to the `./dto` import.
- Read the query and pass it to the service:

```ts
@Get()
getBookmarks(
  @GetUser('userId') userId: string,
  @Query() query: PaginationQueryDto,
) {
  return this.bookmarksService.getBookmarks(userId, query);
}
```

### Step 4 — Update the service

In [bookmarks.service.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/bookmarks/bookmarks.service.ts)
(currently line 13), replace `getBookmarks` with:

```ts
async getBookmarks(userId: string, { page, limit }: PaginationQueryDto) {
  const skip = (page - 1) * limit;

  const [items, total] = await this.prisma.$transaction([
    this.prisma.bookmark.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { id: 'asc' }, // stable order so pages don't overlap/skip rows
    }),
    this.prisma.bookmark.count({ where: { userId } }),
  ]);

  return {
    items,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}
```

Remember to add `PaginationQueryDto` to the `./dto` import at the top of the file.

Why `$transaction([...])`: it runs the page query and the count query together,
so `total` is consistent with `items`. Why `orderBy`: without a stable sort the
database can return rows in different orders, causing some rows to appear on two
pages or none.

### Step 5 — (Optional) Document in Swagger

In [bookmarks.controller.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/bookmarks/bookmarks.controller.ts),
add `ApiQuery` to the `@nestjs/swagger` import and decorate the route:

```ts
@ApiQuery({ name: 'page', required: false, example: 1 })
@ApiQuery({ name: 'limit', required: false, example: 10 })
```

### Step 6 — Update / extend the e2e tests

In [app.e2e-spec.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/test/app.e2e-spec.ts):

- Existing `expectJsonLength('data.items', N)` assertions still pass.
- Optionally add a case hitting `/bookmarks?page=1&limit=10` and assert on
  `data.meta` (e.g. `total`, `totalPages`).
- Optionally add a `400` case for an invalid param, e.g. `/bookmarks?page=0`.

---

## How to verify as you go

1. After Step 4, start the app and call:
   `GET /bookmarks?page=1&limit=5` → response `data` should have `items`
   (≤ 5 entries) and a `meta` block.
2. Try `page=2` and confirm you get the next slice.
3. Try `page=0` or `limit=abc` and confirm you get `400 Bad Request`.

## Why this stays simple

- Offset pagination uses Prisma's built-in `skip` / `take` — no new packages.
- Reuses the `ValidationPipe` you already have for validation + coercion.
- One `$transaction` round trip returns both the page and the total count.
