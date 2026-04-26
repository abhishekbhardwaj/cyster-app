# Hono Full-Stack API Starter

> A production-ready, type-safe API starter built with Hono, featuring OpenAPI documentation, authentication, and modern development tools.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.8-orange.svg)](https://hono.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10-2d3748.svg)](https://www.prisma.io/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.2-green.svg)](https://www.better-auth.com/)

## 🚀 Features

This starter provides everything you need to build a modern, scalable API:

### 🏗️ **Core Framework**

- **[Hono](https://hono.dev/)** - Ultra-fast web framework with excellent TypeScript support
- **[OpenAPI](https://www.openapis.org/)** integration via `@hono/zod-openapi` and `@scalar/hono-api-reference`
- **Type-safe routing** with Zod validation and automatic OpenAPI spec generation

### 🔐 **Authentication & Authorization**

- **[Better Auth](https://www.better-auth.com/)** - Modern, secure authentication library
- **Multiple auth strategies**: User sessions, API keys, and internal authentication
- **Organization-based access control** with role-based permissions
- **Built-in email verification** and password reset flows

### 🗄️ **Database & ORM**

- **[Prisma](https://www.prisma.io/)** - Type-safe database access with PostgreSQL
- **Migration system** with development and production workflows
- **Database seeding** and testing utilities
- **Connection pooling** and optimization

### 📧 **Email System**

- **[JSX Email](https://jsx.email/)** - Build beautiful emails with React components
- **[Nodemailer](https://www.nodemailer.com/)** - Reliable email delivery
- **Template system** with live preview and compatibility checking
- **SMTP configuration** with environment-based setup

### 🧪 **Testing & Quality**

- **[bun:test](https://bun.sh/docs/cli/test/)** - Fast unit and integration testing
- **Coverage reporting** and test utilities
- **API testing** with request/response validation
- **Database testing** with isolated test environments

### 🛠️ **Developer Experience**

- **ESLint v9** with Prettier and import sorting
- **Husky hooks** with lint-staged for code quality
- **[Conventional Commits](https://www.conventionalcommits.org/)** via commitlint and commitizen
- **Environment validation** with `@t3-oss/env-core`
- **Hot reload** development server
- **CLI commands** via Commander.js

## 📋 Prerequisites

- **[Bun](https://bun.sh/)** - JavaScript runtime and package manager
- **PostgreSQL** database
- **SMTP server** (for email functionality)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd hono-fullstack-api-starter
bun install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

#### Required Environment Variables

```env
# Environment
APP_ENV="local"
NODE_ENV="development"

# Application
APP_NAME="hono-fullstack-api-starter"
BASE_APP_URL="http://localhost:3838"
APP_AUTH_SECRET="your-secret-key-here"
BACKOFFICE_INTERNAL_API_SECRET="your-backoffice-secret"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
DIRECT_DATABASE_URL="postgresql://username:password@localhost:5432/mydb"

# Email (SMTP)
SMTP_SERVER="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_USERNAME="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="noreply@yourapp.com"
```

### 3. Database Setup

Initialize your database with Prisma:

```bash
# Generate Prisma client
bun prisma:generate

# Run database migrations
bun prisma:migrate:dev

# Optional: Open Prisma Studio to view your data
bun prisma:studio
```

### 4. Start Development Server

```bash
bun dev
```

Your API will be available at `http://localhost:4444`

## 📖 API Documentation

Once your server is running, explore the interactive API documentation:

| Service            | Endpoint                                                                 | Description                            |
| ------------------ | ------------------------------------------------------------------------ | -------------------------------------- |
| **App Service**    | [`/app-service/openapi`](http://localhost:4444/app-service/openapi)      | Dashboard and client-facing endpoints  |
| **Back Office**    | [`/back-office/openapi`](http://localhost:4444/back-office/openapi)      | Administrative and internal operations |
| **Developer**      | [`/openapi`](http://localhost:4444/openapi)                              | External API integration documentation |
| **Authentication** | [`/app-service/auth/**`](http://localhost:4444/app-service/auth/openapi) | Better Auth integration endpoints      |

### Router Architecture

This starter uses a **three-router architecture** for clear separation of concerns:

- **App Service Router** (`/app-service`): SaaS dashboard and business management endpoints where customers manage accounts, generate API keys, and view analytics
- **Back Office Router** (`/back-office`): Administrative utilities guarded by private secrets for internal operations
- **Developer Router** (`/`): Core service API endpoints for third-party integrations, customer automations, and application integrations - this is the product API that customers integrate into their applications

## 🗂️ Project Structure

```
src/
├── app.ts                  # Main Hono application setup
├── bun.ts                  # Bun server entry point
├── env.ts                  # Environment validation schema
├── console.ts              # CLI commands entry point
├── middleware/             # Hono middleware
│   ├── prisma-middleware.ts
│   ├── user-session-authentication-middleware.ts
│   ├── organization-api-key-authentication-middleware.ts
│   └── ...
├── routers/                # API route handlers (3-router architecture)
│   ├── app-service/        # Dashboard/client-facing routes (/app-service)
│   │   ├── router.ts       # Better Auth integration, user management
│   │   ├── organization/   # Organization and API key management
│   │   │   └── api-keys/
│   │   │       ├── schema.ts     # OpenAPI route definitions
│   │   │       └── handler.ts    # Route handlers
│   │   └── static/         # Static routes (contact forms, etc.)
│   ├── back-office/        # Administrative routes (/back-office)
│   │   ├── router.ts       # Internal operations, guarded by secrets
│   │   └── onboard/        # Entity onboarding workflows
│   ├── developer/          # External API routes (/)
│   │   └── router.ts       # Third-party integrations, documentation
│   └── health-router.ts    # Health check endpoints
├── services/               # Business logic
│   ├── auth.ts            # Better Auth configuration
│   ├── database/          # Database services
│   └── email/             # Email service
├── utils/                 # Utility functions
│   ├── hono.ts           # Hono utilities and types
│   ├── constants.ts      # Application constants
│   └── ...
└── prisma/
    ├── schema.prisma     # Database schema
    ├── migrations/       # Database migrations
    └── prisma.ts        # Prisma client setup
```

## 🛠️ Development Commands

### Core Development

```bash
bun dev              # Start development server with hot reload
bun typecheck        # Run TypeScript type checking
bun lint             # Run ESLint
bun format           # Format code with Prettier
bun commit           # Interactive commit with Conventional Commits
```

### Database Operations

```bash
bun prisma:generate      # Generate Prisma client
bun prisma:migrate:dev   # Create and apply migration
bun prisma:migrate       # Deploy migrations (production)
bun prisma:push          # Push schema changes (development only)
bun prisma:reset         # Reset database and apply all migrations
bun prisma:studio        # Open Prisma Studio GUI
```

### Email Development

```bash
bun email:create [TemplateName]  # Create new email template
bun email:preview                # Start email preview server
bun email:check                  # Check email compatibility
```

### Testing

```bash
bun test             # Run all tests
bun test:watch       # Run tests in watch mode
bun test:coverage    # Run tests with coverage report
```

### Utilities

```bash
bun console [command]           # Run custom CLI commands
bun update-all-dependencies     # Update all dependencies
```

## 🏗️ Building Your API

### 1. Creating New Routes

Follow the project's pattern of separating concerns:

1. **Schema Definition** (`schema.ts`):

```typescript
import { createRoute, z } from '@hono/zod-openapi'

import { generateRoute } from '@/utils/route'

export const getUserRoute = createRoute({
  path: generateRoute(RoutePrefix.APP_SERVICE, '/users/{id}'),
  method: 'get',
  summary: 'Get user by ID',
  // ... OpenAPI configuration
})
```

2. **Handler Implementation** (`handler.ts`):

```typescript
import { type OpenAPIAppRouteHandler } from '@/utils/hono'

export const getUserHandler: OpenAPIAppRouteHandler<typeof getUserRoute> = async (c) => {
  const { id } = c.req.valid('param')
  const user = await c.get('prisma').user.findUnique({ where: { id } })
  return c.json({ code: ResponseCode.SUCCESS, data: user })
}
```

3. **Router Registration** (`router.ts`):

```typescript
appServiceRouter.openapi(getUserRoute, getUserHandler)
```

### 2. Choose the Right Router

Select the appropriate router based on your endpoint's purpose:

- **App Service** (`/app-service`): For SaaS dashboard endpoints - account management, API key generation, usage analytics, billing
- **Back Office** (`/back-office`): For administrative operations with internal authentication
- **Developer** (`/`): For core service API endpoints that customers integrate into their applications or automate against

### 3. Database Modeling

Update `prisma/schema.prisma` and create migrations:

```bash
# After modifying schema.prisma
bun prisma:migrate:dev --name add_user_table
```

### 4. Email Templates

Create new email templates:

```bash
bun email:create WelcomeEmail
```

Then implement the template in `src/services/email/templates/` and add the sending function to `src/services/email/templates.ts`.

## 🔐 Authentication Guide

The starter includes multiple authentication strategies matched to each router:

### App Service Router Authentication

- **User Sessions**: Cookie-based authentication via Better Auth
- **Organization API Keys**: For programmatic access to user resources
- **Better Auth Integration**: Automatic session management and protected routes

### Back Office Router Authentication

- **Private Secrets**: Internal authentication for administrative operations
- **Service-to-Service**: Secured endpoints for back-office utilities

### Developer Router Authentication

- **API Keys**: Generated by customers through the app-service dashboard, used for service integrations
- **Public Endpoints**: Some endpoints may be publicly accessible
- **Core Service**: This is the product API that customers pay for and integrate into their applications

## 🚀 Deployment

### Environment Setup

For production deployment, ensure these environment variables are configured:

```env
NODE_ENV="production"
APP_ENV="production"
DATABASE_URL="your-production-database-url"
APP_AUTH_SECRET="secure-production-secret"
# ... other production configs
```

### Database Migrations

```bash
# Deploy pending migrations
bun prisma:migrate

# Generate production client
bun prisma:generate
```

### Build and Run

```bash
# Install dependencies
bun install --frozen-lockfile

# Run the application
bun dev
# or
bun src/bun.ts
```

## 📚 Documentation

Comprehensive documentation is available in `docs/backend/` at the monorepo root:

### Getting Started

- **[Quickstart Guide](../../docs/backend/quickstart.md)** - Get from zero to running API in under 5 minutes
- **[Code Patterns](../../docs/backend/patterns.md)** - Copy-paste reference for common operations

### Development Guides

- **[API Development Guide](../../docs/backend/api-development.md)** - Complete guide to building APIs with best practices
- **[Hono Development Guide](../../docs/backend/hono.md)** - Hono patterns, OpenAPI, CORS, and routing examples
- **[Database Guide](../../docs/database.md)** - Prisma, PostgreSQL, and database patterns
- **[Communications Guide](../../docs/communications.md)** - Email templates, sending, and SMTP configuration
- **[Testing Guide](../../docs/backend/testing.md)** - Testing strategies and utilities

### Reference

- **[Project Structure](../../docs/backend/structure.md)** - Detailed project organization and file structure
- **[Deployment Guide](../../docs/backend/deployment.md)** - Environment setup, deployment strategies, and production tips

## 🤝 Contributing

1. Follow [Conventional Commits](https://www.conventionalcommits.org/)
2. Run `bun commit` for guided commit messages
3. Ensure tests pass: `bun test`
4. Maintain code quality: `bun lint && bun typecheck`

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check the [documentation](../../docs/backend/)
- Review existing [issues](../../issues)
- Create a [new issue](../../issues/new) for bugs or feature requests

---

**Ready to build something amazing?** 🚀

Start by exploring the [API documentation](http://localhost:4444/openapi) and checking out the [development guide](../../docs/backend/hono.md).
