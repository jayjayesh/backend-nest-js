# Plan: Modularize & Standardize NestJS API Responses

This plan details how to implement a consistent, unified API response format across all endpoints in your NestJS application. 

For a beginner, the key concept to understand is that we do not want to manually wrap every single service or controller response in a standard structure. Instead, NestJS provides two powerful built-in mechanisms that can intercept and format responses globally:

1. **NestJS Interceptors (for Successful Responses : 200, 201, etc.)**:
   Interceptors intercept the outgoing response of a controller *before* it is sent to the client. We will build a `TransformInterceptor` to wrap successful responses in a standard structure like:
   ```json
   {
     "success": true,
     "statusCode": 200,
     "message": "Success",
     "data": { ... }
   }
   ```

2. **NestJS Exception Filters (for Error Responses : 400, 401, 403, 404, 500, etc.)**:
   Interceptors are bypassed when an error/exception is thrown in your code (e.g., credentials incorrect, resource not found). NestJS routes exceptions to **Exception Filters**. We will build a global `AllExceptionsFilter` to catch all errors and format them matching our standard API envelope:
   ```json
   {
     "success": false,
     "statusCode": 400,
     "message": "Bad Request validation errors or description",
     "error": "Bad Request",
     "timestamp": "2026-06-25T10:45:10Z",
     "path": "/auth/sign-in"
   }
   ```

---

## User Review Required

> [!WARNING]
> Standardizing responses globally will change the structure of JSON returned by **all** endpoints.
> - Client applications (like mobile or web apps connecting to this backend) will need to read data from `data` key instead of the root of the JSON body.
> - E2E tests in [app.e2e-spec.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/test/app.e2e-spec.ts) will need updates because they expect the response structure to be flat (e.g. they assert on status codes and fields at the root of the response body). We will update these test cases as part of this plan.

---

## Proposed Changes

We will create a `common` folder for reusable interceptors and exception filters, register them in `main.ts`, and update our E2E tests to match.

### Common Module Abstractions

#### [NEW] [transform.interceptor.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/common/interceptors/transform.interceptor.ts)
A global response interceptor to format all successful responses.  (status code 200, 201, etc.)
- Implements `NestInterceptor`.
- Uses RxJS `map` operator to wrap any returned controller data in the standard `{ success: true, statusCode, message, data }` format.

#### [NEW] [all-exceptions.filter.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/common/filters/all-exceptions.filter.ts)
A global exception filter to catch all validation and HTTP exceptions. (status code 400, 401, 403, 404, 500, etc.)
- Implements `ExceptionFilter`.
- Handles both standard NestJS `HttpException`s (like `ForbiddenException` and Validation Pipe errors) and other raw system errors (internal server errors).
- Returns the standard `{ success: false, statusCode, message, error, timestamp, path }` JSON format.

---

### Global Registration

#### [MODIFY] [main.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/src/main.ts)
Register both the Interceptor and Exception Filter globally so they apply to all routes automatically:
```typescript
app.useGlobalInterceptors(new TransformInterceptor());
app.useGlobalFilters(new AllExceptionsFilter());
```

---

### E2E Testing Adjustments

#### [MODIFY] [app.e2e-spec.ts](file:///Users/jayeshlathiya/Documents/AppDevelopment/FlutterApps/MyApps/backend-nest-js/test/app.e2e-spec.ts)
Update Pactum assertion statements:
- When storing headers or tokens, adjust paths (e.g., from `'access_token'` to `'data.access_token'`).
- Update expected empty list checks (e.g., expecting `{ data: [] }` or utilizing custom json assertions).

---

## Verification Plan

### Automated Tests
Run E2E tests before and after the change to verify that everything works correctly:
```bash
pnpm test:e2e
```
We will ensure that all 17+ tests pass successfully under the new response structure.

### Manual Verification
We will verify standard API response envelopes by inspecting endpoints or E2E logs.
