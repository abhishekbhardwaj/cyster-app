# Deployment Guide

This document covers deploying the backend app (`apps/backend/`) from the Turborepo monorepo. For platform-specific deployment instructions, refer to the official Hono documentation:

**[Hono Deployment Documentation](https://hono.dev/docs/getting-started/basic)**

## Runtime

The backend uses Bun. The runtime entry point is `apps/backend/src/bun.ts`.

```bash
# From the monorepo root
bun run dev

# From apps/backend/
bun dev

# Direct runtime entry point
bun apps/backend/src/bun.ts
```

## Environment Variables

Read `packages/env/src/backend.ts` for the complete list of required variables and their validation schema. Ensure all required variables are configured before deploying.

## Database Migrations

Before starting the application in production, deploy database migrations from `packages/database/`:

```bash
cd packages/database
bun database:migrate
```

## Related Documentation

- [Database Guide](../database.md) - Database schema, migrations, and Prisma patterns
- [Communications Guide](../communications.md) - Email service setup and SMTP configuration
- [Project Structure](./structure.md) - Understanding the project organization
