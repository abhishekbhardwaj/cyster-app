# Code Patterns

Quick reference for common operations in the backend. Read the source files directly for copy-paste examples. They are the sole source of truth.

## Route Patterns

Each route follows the schema -> handler -> router pattern. Read existing routes for real examples:

| Pattern                               | Example File                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| Single-file route (simple)            | `apps/backend/src/routers/app-service/static/contact.ts`                                |
| Separate schema and handler (complex) | `apps/backend/src/routers/app-service/organization/api-keys/schema.ts` and `handler.ts` |
| Router wiring                         | `apps/backend/src/routers/app-service/router.ts`                                        |

Routes are wired in the domain's `router.ts` via `.openapi(route, handler)`.

---

## Response Patterns

All responses use the `ApiResponse` type from `apps/backend/src/utils/hono.ts` with `ResponseCode` from `apps/backend/src/utils/constants.ts`.

Pattern:

```typescript
c.json(
  {
    code: ResponseCode.SUCCESS,
    message: 'Optional message',
    data,
  } satisfies ApiResponse,
  HttpStatusCodes.OK,
)
```

Read any existing handler for examples of success, not-found, forbidden, and error responses.

---

## Database Patterns

Prisma is accessed via `c.get('prisma')` in handlers. Read existing handlers and `apps/backend/src/services/database/` for query patterns including:

- Simple queries, includes, and selects
- Create, update, and delete operations
- Transactions
- Type-safe include configs using `satisfies ...DefaultArgs` (see `apps/backend/src/services/database/organization-service.ts`)

---

## Authentication Patterns

Three authentication strategies, each with its own middleware in `apps/backend/src/middleware/`:

| Strategy                    | Middleware                                          | Usage                            |
| --------------------------- | --------------------------------------------------- | -------------------------------- |
| User Session                | `user-session-authentication-middleware.ts`         | App Service routes               |
| API Key                     | `organization-api-key-authentication-middleware.ts` | Developer and App Service routes |
| Internal                    | `internal-back-office-authentication-middleware.ts` | Back Office routes               |
| Either (session OR API key) | Combine with `some()` from `hono/combine`           | Flexible routes                  |

After authentication, access context variables with `c.get('user')`, `c.get('session')`, and `c.get('organization')`.

For organization access control, use `checkAccessToOrganization()` from `apps/backend/src/routers/app-service/access-utilities.ts`.

---

## Testing Patterns

Read existing tests for copy-paste templates:

| Pattern                 | Example File                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Basic API test setup    | `apps/backend/tests/api/health.test.ts`                                                     |
| Authenticated requests  | `apps/backend/tests/api/app-service/organization/api-keys.test.ts`                          |
| Email mock verification | `apps/backend/tests/api/app-service/static/contact.test.ts`                                 |
| Auth flows              | `apps/backend/tests/api/app-service/authentication-e2e.test.ts`                             |
| Unit tests              | `apps/backend/tests/utils/api-key.test.ts`, `apps/backend/tests/utils/phone-number.test.ts` |

Test infrastructure lives in `apps/backend/tests/__reusable-test-utilities__/`. Email mocks live in `apps/backend/tests/__mocks__/`.

---

## Error Handling Patterns

Two approaches:

- In handlers: return `c.json()` with the appropriate `ResponseCode` and `HttpStatusCodes` for expected business logic errors
- In middleware: throw exceptions extending `BaseException` from `apps/backend/src/exceptions/base-exception.ts` to abort request processing

Read `apps/backend/src/exceptions/` for existing exception classes and existing handlers for response patterns.

---

## File Organization

Single-file routes: schema and handler in one file for simple endpoints. Example: `apps/backend/src/routers/app-service/static/contact.ts`

Separate files: `schema.ts` plus `handler.ts` in a directory for more complex endpoints. Example: `apps/backend/src/routers/app-service/organization/api-keys/`

---

## Related Documentation

- [Hono Development Guide](./hono.md) - Hono patterns, OpenAPI, and project utilities
- [API Development Guide](./api-development.md) - Complete API development workflow
- [Database Guide](../database.md) - Prisma patterns and database integration
- [Testing Guide](./testing.md) - Testing strategies and infrastructure
