# Project Structure Documentation

This document outlines the high-level structure and key concepts for the backend app. Explore the directories directly for the current file layout. The filesystem is the source of truth.

## Overview

The backend is a Hono API application with OpenAPI and authentication.

> For LLM agents: see [root AGENTS.md](../../AGENTS.md) for general philosophy and monorepo conventions, and [docs/backend/agents.md](./agents.md) for backend-specific patterns.

Key technologies include:

- Framework: Hono
- Database: PostgreSQL via Prisma and `@repo/database`
- Authentication: Better Auth
- Email: `@repo/communications`
- Testing: `bun:test`
- Schema validation: Zod with `@hono/zod-openapi`
- Environment variables: `@repo/env/backend`
- Package manager: Bun

## Top-Level Directory Layout

| Directory                      | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| `apps/backend/src/`            | Main backend source code                             |
| `apps/backend/src/routers/`    | API route handlers organized by domain               |
| `apps/backend/src/middleware/` | Hono middleware                                      |
| `apps/backend/src/services/`   | Auth and database helpers                            |
| `apps/backend/src/utils/`      | Constants, Hono helpers, route generation, utilities |
| `apps/backend/src/exceptions/` | Custom exception classes                             |
| `apps/backend/tests/`          | API and utility tests                                |
| `packages/database/`           | Shared Prisma schema, migrations, and client         |
| `packages/communications/`     | Shared email service and templates                   |
| `packages/env/`                | Shared type-safe env validation                      |
| `docs/backend/`                | Backend-specific documentation                       |

## Key Files and Concepts

- `apps/backend/src/app.ts`: Main Hono application setup with routes, middleware, CORS, and error handling
- `apps/backend/src/bun.ts`: Bun runtime entry point
- `packages/env/src/backend.ts`: Type-safe environment variable validation
- `apps/backend/src/utils/constants.ts`: `ResponseCode`, `RoutePrefix`, `OpenAPITag`, and related constants
- `apps/backend/src/utils/hono.ts`: Hono types, API response helpers, and shared utilities
- `apps/backend/src/services/auth.ts`: Better Auth configuration and integration
- `packages/database/prisma/schema.prisma`: Single source of truth for the database schema
- `packages/database/src/client.ts`: Prisma client factory and singleton

### Router Architecture

- `apps/backend/src/routers/app-service/`: Client-facing SaaS dashboard endpoints
- `apps/backend/src/routers/back-office/`: Internal admin routes
- `apps/backend/src/routers/developer/`: Developer-facing OpenAPI routes
- `apps/backend/src/routers/health-router.ts`: Health check endpoints

### Middleware

Authentication middleware files in `apps/backend/src/middleware/` implement different strategies:

- `user-session-authentication-middleware.ts` - Cookie-based via Better Auth
- `organization-api-key-authentication-middleware.ts` - Bearer token API keys
- `internal-back-office-authentication-middleware.ts` - Static secret for internal operations

## Development Workflow and Useful Commands

1. Installation: `bun install`
2. Environment setup: `cp .env.backend.example .env.backend`, then read `packages/env/src/backend.ts` for required variables
3. Database setup: `cd packages/database && bun database:migrate:dev`
4. Development server: `bun run dev` from the monorepo root or `cd apps/backend && bun dev`
5. Email preview: `cd packages/communications && bun email:preview`
6. Testing: `bun run test` from root or `cd apps/backend && bun test`
7. Linting and formatting: `bun run lint`, `bun run format`, `bun run format:fix`
8. Type checking: `bun run typecheck`
9. Committing: `bun commit`
10. Custom CLI commands: `cd apps/backend && bun console <command>`

## Related Documentation

- [Quickstart Guide](./quickstart.md) - Get from zero to a running backend
- [Code Patterns](./patterns.md) - Reference for common operations
- [Hono Development Guide](./hono.md) - Hono patterns, OpenAPI, and project utilities
- [API Development Guide](./api-development.md) - Complete API development workflow
- [Database Guide](../database.md) - Prisma patterns, schema design, and database integration
- [Communications Guide](../communications.md) - Email templates and sending
- [Testing Guide](./testing.md) - Testing strategies, patterns, and infrastructure
- [Deployment Guide](./deployment.md) - Environment setup and deployment strategies
