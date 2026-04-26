# Quickstart Guide

Get the backend API (`apps/backend/`) running inside the Turborepo monorepo in under 5 minutes.

## Prerequisites

- Bun
- PostgreSQL
- Git

## 1. Clone and Install

```bash
git clone <repository-url>
cd turbo-full-stack-monorepo
bun install
```

## 2. Configure Environment

Environment files live at the monorepo root. The backend expects `.env.backend`:

```bash
cp .env.backend.example .env.backend
```

Edit `.env.backend` with your values. Read `packages/env/src/backend.ts` for the complete list of required variables and their validation rules.

The Turbo `setup:env` task automatically symlinks `.env.backend` from the root into `apps/backend/.env` before `dev` and `build`. You do not need to copy files into the app directory manually.

## 3. Setup Database

```bash
cd packages/database
bun database:migrate:dev
```

## 4. Start Development Server

```bash
# From the monorepo root
bun run dev

# Or start only the backend
cd apps/backend
bun dev
```

The backend API runs at `http://localhost:3838`.

## 5. Test the API

```bash
curl http://localhost:3838/health
open http://localhost:3838/app-service/openapi
```

## 6. Create Your First Endpoint

Follow the schema -> handler -> router pattern used throughout the codebase:

1. Read an existing route for the pattern. Start with `apps/backend/src/routers/app-service/static/contact.ts` for a simple single-file route or `apps/backend/src/routers/app-service/organization/api-keys/` for separate schema and handler files.
2. Create your route file following the same structure.
3. Wire it in the domain's `router.ts` via `.openapi(route, handler)`.
4. Test it with `curl http://localhost:3838/app-service/your-endpoint`.

See [Patterns Reference](./patterns.md) and [Hono Guide](./hono.md) for details.

## 7. Next Steps

| Task                     | Documentation                                 |
| ------------------------ | --------------------------------------------- |
| Build API endpoints      | [API Development Guide](./api-development.md) |
| Understand Hono patterns | [Hono Guide](./hono.md)                       |
| Work with database       | [Database Guide](../database.md)              |
| Send emails              | [Communications Guide](../communications.md)  |
| Write tests              | [Testing Guide](./testing.md)                 |
| Deploy                   | [Deployment Guide](./deployment.md)           |
| Common patterns          | [Patterns Reference](./patterns.md)           |

## Common Commands

### From the monorepo root

```bash
bun run dev
bun run typecheck
bun run lint
bun run format
bun run format:fix
bun run test
```

### From `apps/backend/`

```bash
bun dev
bun typecheck
bun lint
bun test
bun test:watch
```

### From `packages/database/`

```bash
bun database:studio
bun database:migrate:dev --name <name>
```

### From `packages/communications/`

```bash
bun email:preview
```
