# API Development Guide

Best practices, patterns, and conventions for developing APIs in `apps/backend/`. Read existing implementations in `apps/backend/src/routers/` for real code examples. They are the source of truth.

> Quick Reference: For Hono-specific patterns, utilities, and Stoker integration, see the [Hono Development Guide](./hono.md).

## Architecture Overview

### Request Flow

```
Client Request -> Hono App (apps/backend/src/app.ts) -> Global Middleware -> Router-specific Middleware -> Route Handler -> Services or Business Logic -> Database (@repo/database) -> Response
```

### Router Architecture

This project uses a three-router architecture to separate concerns:

#### 1. App Service Router (`/app-service`)

Purpose: SaaS dashboard and business management endpoints

- Customer onboarding, account management, API key management
- Organization and user management
- Authentication: User session-based via Better Auth
- Examples: `/app-service/auth/**`, `/app-service/organization/{id}/api-keys`

#### 2. Back Office Router (`/back-office`)

Purpose: Administrative and internal operations

- Admin utilities, one-off scripts, platform configuration
- Authentication: Guarded by private secret (`BACKOFFICE_INTERNAL_API_SECRET`)
- Examples: `/back-office/onboard/new-entity`

#### 3. Developer Router (`/`)

Purpose: Developer-facing OpenAPI docs and future product API routes

- Aggregated OpenAPI documentation for integrators
- Authentication: API key-based when product routes are added
- Examples: `/openapi`, `/openapi.json`

### Layered Architecture

1. Presentation layer: route handlers and OpenAPI schemas
2. Business logic layer: services in `apps/backend/src/services/`
3. Data access layer: Prisma via `@repo/database`
4. Cross-cutting concerns: middleware, utilities, constants

## Development Workflow

### 1. Plan Your API

- Define the resource (for example: User, Organization, API Key)
- Identify CRUD operations needed
- Plan URL structure following REST conventions
- Define request and response schemas
- Consider authentication requirements
- Plan error scenarios

### 2. Create Database Schema (if needed)

Update `packages/database/prisma/schema.prisma` following the naming conventions in [Database Guide](../database.md). Run:

```bash
cd packages/database
bun database:migrate:dev --name description
```

### 3. Create Service Layer (if needed)

Add database service code in `apps/backend/src/services/database/`. Read existing services for the pattern. They are query helpers, not business logic layers.

### 4. Create Route Schema

Define Zod schemas and `createRoute` configuration in `schema.ts`. Read existing schemas for the pattern:

- `apps/backend/src/routers/app-service/static/contact.ts` (simple, single-file)
- `apps/backend/src/routers/app-service/organization/api-keys/schema.ts` (separate file)

### 5. Implement Handler

Create handler using `OpenAPIAppRouteHandler<typeof route>` for type safety. Read existing handlers for the pattern:

- `apps/backend/src/routers/app-service/organization/api-keys/handler.ts`

### 6. Wire to Router

Add to the domain router via `.openapi(route, handler)`. Read `apps/backend/src/routers/app-service/router.ts` for the pattern.

## API Design Principles

### REST Conventions

| HTTP Method | Path              | Purpose   | Status Codes  |
| ----------- | ----------------- | --------- | ------------- |
| `GET`       | `/resources`      | List      | 200           |
| `GET`       | `/resources/{id}` | Get by ID | 200, 404      |
| `POST`      | `/resources`      | Create    | 201, 400, 409 |
| `PUT`       | `/resources/{id}` | Update    | 200, 404, 400 |
| `DELETE`    | `/resources/{id}` | Delete    | 200, 404      |

### URL Structure

Use consistent, nested URL patterns:

```
/app-service/users
/app-service/users/{id}
/app-service/organizations/{id}/members
/app-service/organization/{id}/api-keys
```

### Response Format

All responses use the `ApiResponse` type from `apps/backend/src/utils/hono.ts`:

```typescript
interface ApiResponse<T = unknown> {
  code: ResponseCode
  message?: string
  data?: T
}
```

Read existing handlers for concrete response examples.

### Schema-First Development

Always define Zod schemas first, then use them in `createRoute` definitions. This ensures OpenAPI docs are generated automatically and input and output are validated.

## Authentication and Authorization

### Authentication Strategies

| Strategy                    | Router                    | Middleware                                          | How                          |
| --------------------------- | ------------------------- | --------------------------------------------------- | ---------------------------- |
| User Session                | App Service               | `user-session-authentication-middleware.ts`         | Cookie-based via Better Auth |
| API Key                     | Developer and App Service | `organization-api-key-authentication-middleware.ts` | Bearer token                 |
| Internal                    | Back Office               | `internal-back-office-authentication-middleware.ts` | Static Bearer token          |
| Either (session OR API key) | Flexible                  | `some()` from `hono/combine`                        | First match wins             |

Read the middleware files in `apps/backend/src/middleware/` for implementation details.

### Access Control

The system implements organization-scoped access control:

- User sessions validate membership in organizations
- API keys are scoped to specific organizations
- Internal tokens have system-level access without organization scope

Use `checkAccessToOrganization()` from `apps/backend/src/routers/app-service/access-utilities.ts` for organization access checks. Read existing handlers for usage patterns.

## Data Validation

### Input Validation

All input is validated via Zod schemas in route definitions. Read existing schemas for patterns including:

- Basic field validation
- Optional fields with defaults
- Custom refinements
- Path parameter validation
- Query parameter handling

### Output Validation

Validate responses with `.parse()` or `.parseAsync()` against Zod schemas before sending. This catches structural errors before they reach the client.

## Error Handling

### Exception System

The project includes custom exceptions built on Hono's `HTTPException`. Read `apps/backend/src/exceptions/` for existing implementations.

- `BaseException` (`apps/backend/src/exceptions/base-exception.ts`) - Extends `HTTPException` with a `ResponseCode`
- `AuthenticationException` - 401 Unauthorized

Create new exceptions by extending `BaseException` with the appropriate status code and `ResponseCode`.

### When to Use Exceptions vs Return Responses

Use exceptions when:

- Middleware needs to abort request processing
- You want centralized error handling
- The error should bubble through the global error handler

Return `c.json()` responses when:

- The handler owns the expected business-logic failure
- You need fine-grained control over the response
- The error is part of normal request flow

### Global Error Handler

Read `apps/backend/src/app.ts` for the global error handler. It catches unhandled errors and returns standardized responses. It handles `HTTPException`, `ZodError`, and generic errors with appropriate status codes.

## Testing APIs

The project uses `bun:test` with `APITestClient` for integration testing. See the [Testing Guide](./testing.md) for comprehensive patterns, infrastructure, and examples.

## Performance Optimization

### Database

- Use `select` to limit returned fields
- Use `include` judiciously to avoid N+1 queries
- Implement pagination for large datasets
- Add indexes strategically in `packages/database/prisma/schema.prisma`
- Use `Promise.all` only when parallelism is genuinely correct

### Response

- Implement response compression in middleware if needed
- Use appropriate HTTP caching headers
- Minimize response payload size

## Security Best Practices

### Input Sanitization

Always validate and sanitize inputs with Zod schemas. Use helpers like `.trim()`, `.toLowerCase()`, and `.max()` where appropriate.

### SQL Injection Prevention

Prisma provides parameterized queries by default. Prefer Prisma's query builder over raw SQL when possible.

### Authentication

- Always verify authentication in protected routes via middleware
- Use strong session secrets
- Implement proper logout flows
- Consider rate limiting for auth endpoints

### Authorization

- Implement least privilege
- Verify permissions for each operation
- Do not rely on client-side authorization
- Log authorization failures for monitoring

### Data Exposure Prevention

- Never return sensitive fields such as passwords or tokens
- Mask sensitive data in logs
- Use environment variables for secrets
- Implement proper CORS policies

## Related Documentation

- [Hono Development Guide](./hono.md) - Hono patterns, OpenAPI, and project utilities
- [Database Guide](../database.md) - Prisma patterns, schema design, and database integration
- [Communications Guide](../communications.md) - Email templates and sending
- [Testing Guide](./testing.md) - API testing strategies and infrastructure
- [Deployment Guide](./deployment.md) - Environment setup and deployment
- [Project Structure](./structure.md) - Project organization overview
