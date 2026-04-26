# Hono Development Guide

This document provides guidelines for developing API routes using Hono in `apps/backend/`, covering basic routes and OpenAPI-documented routes with `@hono/zod-openapi`. Read the source files directly for implementation details. They are the source of truth.

## Project Setup Overview

- Main application: `apps/backend/src/app.ts` - global middleware, error handling, and router mounting
- Routers: organized by domain in `apps/backend/src/routers/` (`app-service`, `back-office`, `developer`, `health`)
- Middleware: `apps/backend/src/middleware/` - authentication strategies, IP handling, and Prisma injection
- Services: `apps/backend/src/services/` - auth and database helpers
- Utilities: `apps/backend/src/utils/` - constants, Hono helpers, and route generation

Refer to `docs/backend/structure.md` for a complete project overview.

## Understanding Hono Context (`HonoContext`)

Route handlers and middleware receive a `Context` object, typed as `HonoContext` in `apps/backend/src/utils/hono.ts`.

### Request Access (`c.req`)

- Path params: `c.req.param('id')` or `c.req.param()`
- Query strings: `c.req.query('search')` or `c.req.queries('tags')`
- Headers: `c.req.header('User-Agent')`
- Body parsing: `c.req.json()`, `c.req.text()`, `c.req.parseBody()`, `c.req.formData()`
- Validated data: `c.req.valid('param')`, `c.req.valid('query')`, `c.req.valid('json')`
- Other: `.url`, `.method`, `.path`, `.raw`

### Response Helpers

- `c.json(data, status?, headers?)` - JSON responses
- `c.text(text, status?, headers?)` - Plain text
- `c.html(html, status?, headers?)` - HTML
- `c.notFound()` - 404 response
- `c.redirect(location, status?)` - Redirect response

### Context Variables (`c.set` / `c.get`)

Set by project middleware and available within the same request:

| Variable                | Set By                                              | Purpose                    |
| ----------------------- | --------------------------------------------------- | -------------------------- |
| `c.get('prisma')`       | `prisma-middleware.ts`                              | Prisma client instance     |
| `c.get('user')`         | `user-session-authentication-middleware.ts`         | Authenticated user or null |
| `c.get('session')`      | `user-session-authentication-middleware.ts`         | User session or null       |
| `c.get('organization')` | `organization-api-key-authentication-middleware.ts` | Organization or null       |
| `c.get('ipAddress')`    | `ip-address-middleware.ts`                          | Client IP or null          |
| `c.get('requestId')`    | `hono/request-id`                                   | Unique request ID          |

Type definitions (`HonoBindings`, `HonoVariables`, `HonoContextType`, `HonoContext`) live in `apps/backend/src/utils/hono.ts`.

## Project Utilities (`apps/backend/src/utils/hono.ts`)

This project centralizes Hono-related utilities in `apps/backend/src/utils/hono.ts`. Prefer importing from `@/utils/hono` rather than directly from Hono or Stoker where applicable.

### When to Use Project Utilities vs Stoker

Use project utilities (`@/utils/hono`) for:

- HTTP status codes: `HttpStatusCodes`
- API response formatting: `ApiResponse`, `ApiResponseSchema`
- Response content helpers: `createGenericApiResponseJsonContent`, `createApiResponseJsonContentWithData`, `createValidationErrorApiResponseJsonContent`
- Type definitions: `HonoContext`, `HonoContextType`, `OpenAPIAppRouteHandler`
- Validation: `defaultHookForZodOpenAPI`
- Utilities: `transformZodIssue`, `convertStatusCodeToResponseCode`, `honoFactory`

Use Stoker directly for helpers that the project intentionally imports without wrapping. In the current backend codebase, that mainly means request-body helpers like `jsonContentRequired` from `stoker/openapi/helpers`.

Discover actual Stoker usage by grepping for `stoker/` imports in `apps/backend/src/`.

### Key Utilities Explained

#### `HttpStatusCodes`

Type-safe HTTP status codes instead of raw numbers. Use them in `c.json()` and OpenAPI `responses` definitions.

#### `ApiResponse<T>`

Standard response structure with optional `code`, `message`, and `data` fields. Read `apps/backend/src/utils/hono.ts` for the schema definition.

#### Response Content Helpers

- `createGenericApiResponseJsonContent(description, defaultResponseCode?)`
- `createApiResponseJsonContentWithData(schema, description)`
- `createValidationErrorApiResponseJsonContent(description)`

#### `ResponseCode`

Enum for specific response codes. Defined in `apps/backend/src/utils/constants.ts`. Read that file for available values.

#### `defaultHookForZodOpenAPI`

Passed to `OpenAPIHono` instances to automatically catch Zod validation errors and return standardized 400 responses.

#### `OpenAPIAppRouteHandler<TRouteConfig>`

Type helper for strongly typing route handlers when separating schema from handler files. It keeps route definitions and handler implementations in sync at compile time.

### Route Path Generation (`generateRoute`)

Located in `apps/backend/src/utils/route.ts`. Always use it when defining route paths:

```typescript
path: generateRoute(RoutePrefix.APP_SERVICE, '/organization/{id}/api-keys')
```

Route prefixes are defined in `apps/backend/src/utils/constants.ts`.

## CORS Configuration

CORS is configured in `apps/backend/src/app.ts` using Hono's built-in `cors` middleware.

- Default origins: `TrustedInboundOrigins` in `apps/backend/src/utils/constants.ts`
- Custom origins: `TRUSTED_ORIGINS` env var
- Origin calculation: `calculateTrustedInboundOrigins()` in `apps/backend/src/utils/cors.ts`

Read `apps/backend/src/app.ts` and `apps/backend/src/utils/cors.ts` for the exact logic.

| Setting         | Purpose                        |
| --------------- | ------------------------------ |
| `origin`        | Allowed origins                |
| `allowHeaders`  | Headers clients can send       |
| `allowMethods`  | HTTP methods allowed           |
| `exposeHeaders` | Headers clients can read       |
| `maxAge`        | Preflight cache duration       |
| `credentials`   | Allow cookies and auth headers |

## Writing Basic Routes (Without OpenAPI)

For simple internal routes where OpenAPI docs are not needed, use a standard `Hono` instance. Read `apps/backend/src/routers/health-router.ts` for the pattern.

Key steps:

1. Create `new Hono<HonoContextType>()` when you need typed context
2. Define routes with `.get()`, `.post()`, and friends
3. Use `ResponseCode` and `HttpStatusCodes` for consistent responses
4. Export and mount the router in `apps/backend/src/app.ts`

## Writing OpenAPI Documented Routes

For most API endpoints, use `@hono/zod-openapi` so OpenAPI documentation is generated from the route schema.

### Preferred Approach: Separate Files

Use three files per feature:

1. `schema.ts` - Zod schemas and `createRoute` configuration
2. `handler.ts` - Business logic using `OpenAPIAppRouteHandler<typeof route>`
3. `router.ts` - Wires routes with `.openapi(route, handler)`

Read these real implementations for the pattern:

- Single-file route: `apps/backend/src/routers/app-service/static/contact.ts`
- Separate schema and handler: `apps/backend/src/routers/app-service/organization/api-keys/schema.ts` and `handler.ts`
- Router wiring: `apps/backend/src/routers/app-service/router.ts`

### Alternative: Inline Handlers

For very small endpoints, you can define the handler inline as the second argument to `.openapi()`. The backend currently prefers the separated approach.

### Key Implementation Points

- Instantiate `new OpenAPIHono<HonoContextType>({ defaultHook: defaultHookForZodOpenAPI })`
- Use `createRoute` for OpenAPI-documented routes
- Retrieve validated input with `c.req.valid('param')`, `c.req.valid('query')`, and `c.req.valid('json')`
- Access context via `c.get('prisma')`, `c.get('user')`, `c.get('session')`, and `c.get('organization')`
- Validate response data with `.parse()` or `.parseAsync()` before sending when helpful
- Construct responses with `c.json({ code: ResponseCode.XXX, data, message } satisfies ApiResponse, HttpStatusCodes.YYY)`
- Mask sensitive data before sending

## Error Handling Summary

- Validation errors (400) are handled automatically by `defaultHookForZodOpenAPI`
- Expected application errors should return `c.json()` with the appropriate `ResponseCode` and `HttpStatusCodes`
- Unexpected errors are caught by the global error handler in `apps/backend/src/app.ts`

## Existing Route Documentation Links

1. Auth routes: `/app-service/auth/openapi`
2. App Service router: `/app-service/openapi`
3. Back Office router: `/back-office/openapi`
4. Developer router: `/openapi`

Organization invitation email sending is implemented in `apps/backend/src/services/auth.ts`. Customize it there if your frontend URLs or invitation flow differ.

## Related Documentation

- [API Development Guide](./api-development.md) - Complete API development workflow
- [Database Guide](../database.md) - Prisma patterns and database integration
- [Testing Guide](./testing.md) - Testing strategies for Hono applications
- [Project Structure](./structure.md) - Overview of project organization

## External Resources

- [Stoker GitHub Repository](https://github.com/w3cj/stoker) - Official documentation and source code
- [Hono Documentation](https://hono.dev/) - Core framework documentation
- [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) - OpenAPI integration documentation
