# Prisma and Database Guide

This document outlines conventions, workflow, and usage for Prisma and PostgreSQL in the monorepo. Read `packages/database/prisma/schema.prisma` for the actual schema. It is the sole source of truth.

## 1. Naming Conventions

- Prisma schema: PascalCase models (`User`, `UserAccount`), camelCase fields (`userId`, `createdAt`)
- Database (PostgreSQL): snake_case tables (`users`, `user_accounts`), snake_case columns (`user_id`, `created_at`)
- Mapping: use `@@map("table_name")` for models and `@map("column_name")` for fields

Read `packages/database/prisma/schema.prisma` for examples of this convention in practice. This keeps TypeScript idiomatic while preserving standard SQL naming.

## 2. Project Structure

Prisma files live in `packages/database/`:

- `packages/database/prisma/schema.prisma` - Database schema definition
- `packages/database/src/client.ts` - Prisma client factory and singleton initialization
- `packages/database/src/index.ts` - Public API re-exports
- `packages/database/prisma/migrations/` - Migration history
- `packages/database/generated/` - Generated Prisma Client

## 3. Client Initialization

Read `packages/database/src/client.ts` for the implementation. Key details:

- Uses `@prisma/adapter-pg` for direct TCP connections
- Exposes a `createPrismaClient` factory for custom connection settings
- Exports a `prisma` singleton with a `globalThis` cache for hot reloads
- Enables query logging in development

## 4. Usage in API Routes

The Prisma client is injected into Hono context via `apps/backend/src/middleware/prisma-middleware.ts`. Access it in handlers with `c.get('prisma')`.

Read `apps/backend/src/routers/app-service/organization/api-keys/handler.ts` for a real usage example.

## 5. Useful Scripts

Run these from `packages/database/`:

- `bun database:generate` - Generate Prisma Client after schema changes
- `bun database:migrate:dev` - Create and apply a development migration
- `bun database:migrate` - Apply pending migrations in deployed environments
- `bun database:push` - Push schema changes directly for prototyping
- `bun database:reset` - Reset the database and reapply migrations
- `bun database:studio` - Open Prisma Studio

The monorepo root also exposes matching `bun run database:*` scripts.

## 6. Environment Variables

Read `packages/env/src/backend.ts` for the complete schema. Database-specific variables:

- `DATABASE_URL` - Primary connection string used by Prisma Client
- `DIRECT_DATABASE_URL` - Direct connection string for migrations

The values live in `.env.backend` at the monorepo root.

## 7. Database Schema

Read `packages/database/prisma/schema.prisma` for the complete current schema. Core models:

- `User`
- `Organization`
- `ApiKey`
- `Session`
- `UserAccount`
- `UserVerification`
- `OrganizationMember`
- `OrganizationInvitation`

## 8. Database Service Patterns

Database services in `apps/backend/src/services/database/` are query helpers, not business logic layers. Business logic belongs in route handlers.

Services provide:

- Type-safe include configs using `satisfies ...DefaultArgs`
- Reusable query patterns
- Common database operations

Read these files for the patterns:

- `apps/backend/src/services/database/organization-service.ts`
- `apps/backend/src/services/database/api-keys-service.ts`
- `apps/backend/src/services/database/user-service.ts`

## 9. Migration Best Practices

### Development

1. Make schema changes in `packages/database/prisma/schema.prisma`
2. Create migration: `bun database:migrate:dev --name descriptive_name`
3. Review generated SQL in `packages/database/prisma/migrations/`
4. Test locally before committing

### Production

1. Review pending migrations carefully
2. Back up the database before applying them
3. Deploy with `bun database:migrate`
4. Monitor application behavior after deployment

### Schema Evolution Guidelines

- Adding nullable columns is usually safe
- Adding required columns usually needs defaults or a backfill plan
- Renaming columns or tables requires explicit migration handling
- Dropping columns requires data migration first
- Changing column types may require data transformation

## 10. Performance Optimization

### Indexing

Add strategic indexes for frequently queried fields. Read `packages/database/prisma/schema.prisma` for existing examples such as the `OrganizationMember` index on `organizationId` and `userId`.

### Query Optimization

- Use `select` to limit returned fields
- Use `include` judiciously to avoid N+1 queries
- Implement pagination for large datasets
- Monitor slow queries in production

### Connection Management

- Use connection pooling where appropriate
- Configure connection limits intentionally
- Monitor connection usage in production

## Related Documentation

- [Backend API Development Guide](./backend/api-development.md) - Using database services in API routes
- [Backend Hono Development Guide](./backend/hono.md) - Accessing Prisma through Hono context
- [Backend Testing Guide](./backend/testing.md) - Database testing patterns
- [Backend Deployment Guide](./backend/deployment.md) - Migration deployment and environment setup
