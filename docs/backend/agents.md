# Backend Development Reference

Backend-specific patterns, conventions, and quick reference for LLM agents working in `apps/backend/`. For general philosophy, task approach, risk classification, and monorepo conventions, see the [root AGENTS.md](../../AGENTS.md).

## Tech Stack

- Runtime: Bun
- Framework: Hono with OpenAPI via `@hono/zod-openapi`
- Database: PostgreSQL with Prisma ORM, shared via `@repo/database`
- Authentication: Better Auth
- Email: `@repo/communications/email`
- Testing: `bun:test`
- Env: `@repo/env/backend`

## Import Aliases

- `@/` maps to `apps/backend/src/`
- `tests/` maps to `apps/backend/tests/`

```typescript
import { prisma, type PrismaType } from '@repo/database'
import { env } from '@repo/env/backend'
```

## Key File Locations

See `docs/backend/structure.md` for the full project layout. Key entry points:

- `apps/backend/src/app.ts` - Main Hono application setup
- `packages/env/src/backend.ts` - Environment variable validation (source of truth for required vars)
- `apps/backend/src/utils/constants.ts` - `ResponseCode` enum, route prefixes, tags
- `apps/backend/src/utils/hono.ts` - Hono types, response helpers
- `packages/database/prisma/schema.prisma` - Database schema
- `apps/backend/tests/__reusable-test-utilities__/` - Test infrastructure

## Code Patterns

### Creating API Routes

Each route follows a three-file pattern: `schema.ts` -> `handler.ts` -> `router.ts`. Read any existing route in `apps/backend/src/routers/` for the pattern and follow it exactly.

### Response Codes

Use the `ResponseCode` enum from `apps/backend/src/utils/constants.ts`. Read that file for available codes. It is the source of truth.

### Response Format and Database Access

Read any existing handler in `apps/backend/src/routers/` for response format and `c.get('prisma')` usage. Follow what is already there.

## Environment Variables

Required variables are defined in `packages/env/src/backend.ts`. Read that file for the full list.

Rule: always use `env` from `@repo/env/backend`. Never use `process.env` directly in app code, database code, or communications code outside the env package definitions.

## Common Operations

### Database Changes

```bash
cd packages/database
bun database:migrate:dev --name description_of_change
bun database:generate
```

### Adding New Email Template

Follow the pattern in `packages/communications/src/email/templates/`. Read an existing template and `packages/communications/src/email/templates.ts` before adding a new one.

### Creating Tests

Read `apps/backend/tests/__reusable-test-utilities__/api-test-client.ts` for the test client and any existing test in `apps/backend/tests/api/` for the setup pattern.

### Accessing Email Mocks in Tests

Import from `tests/__mocks__`. Read existing tests that assert on emails for the pattern.

## Documentation

| Task                                | Read These Docs                                                  |
| ----------------------------------- | ---------------------------------------------------------------- |
| Building a new API endpoint         | [api-development.md](./api-development.md), [hono.md](./hono.md) |
| Adding or modifying database models | [database.md](../database.md)                                    |
| Creating email templates            | [communications.md](../communications.md)                        |
| Writing tests                       | [testing.md](./testing.md)                                       |
| Understanding project layout        | [structure.md](./structure.md)                                   |
| Adding logging or observability     | [logging-and-observability.md](./logging-and-observability.md)   |
| Performing a code review            | [code-review.md](./code-review.md)                               |
