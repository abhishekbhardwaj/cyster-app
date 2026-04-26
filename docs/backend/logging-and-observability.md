# Logging & Observability

This document covers the logging architecture and observability options for the backend app (`apps/backend/`) in the Turborepo monorepo.

---

## Overview

The application uses a layered logging approach:

| Layer                  | Tool                           | Purpose                                           |
| ---------------------- | ------------------------------ | ------------------------------------------------- |
| **Structured Logging** | [LogTape](https://logtape.org) | Console/JSON logs for all requests and app events |
| **Observability**      | User choice                    | OpenTelemetry, Sentry, DataDog, etc.              |

---

## Structured Logging with LogTape

### Why LogTape?

- **Zero dependencies** - No transitive dependency bloat
- **Universal runtime** - Works in Bun, Deno, Node.js, Cloudflare Workers, browsers
- **Fast** - Minimal overhead, suitable for high-throughput APIs
- **Structured** - JSON output in production for log aggregation

### Configuration

Logging is configured in `apps/backend/src/utils/logger.ts`. The logger is initialized in `apps/backend/src/bun.ts` before the server starts.

### Log Categories

Use hierarchical categories for fine-grained control. Categories are defined in `apps/backend/src/utils/logger.ts`:

| Category              | Constant               | When to Use                               |
| --------------------- | ---------------------- | ----------------------------------------- |
| `['http']`            | `LogCategory.HTTP`     | HTTP request/response (via @logtape/hono) |
| `['app']`             | `LogCategory.APP`      | General application events                |
| `['app', 'database']` | `LogCategory.DATABASE` | Database queries, connections, errors     |
| `['app', 'auth']`     | `LogCategory.AUTH`     | Login, logout, token refresh, failures    |
| `['app', 'email']`    | `LogCategory.EMAIL`    | Email sending, template rendering         |

To add a new category, update the `LogCategoryKey` type and `LogCategory` object in `apps/backend/src/utils/logger.ts`.

### Environment-Based Output

| Environment   | Output Format          | Log Level    |
| ------------- | ---------------------- | ------------ |
| `local`       | Pretty colored console | `debug`      |
| `development` | JSON lines             | `info`       |
| `production`  | JSON lines             | `info`       |
| `test`        | Silenced               | `fatal` only |

---

## Using the Logger

### In Route Handlers

```typescript
import { getLogger } from '@logtape/logtape'

import { LogCategory } from '@/utils/logger'

export const createOrderHandler = async (c) => {
  const logger = getLogger(LogCategory.APP)
  const userId = c.get('user')?.id

  logger.info('Creating order', { userId })

  try {
    const order = await createOrder(data)
    logger.info('Order created', { orderId: order.id, userId })
    return c.json({ data: order })
  } catch (error) {
    logger.error('Order creation failed', { userId, error: error.message })
    throw error
  }
}
```

### In Services

```typescript
// packages/communications/src/email/index.ts
import { getLogger } from '@logtape/logtape'

import { LogCategory } from '@/utils/logger'

const logger = getLogger(LogCategory.EMAIL)

export async function sendWelcomeEmail(to: string) {
  logger.debug('Sending welcome email', { to })

  try {
    await transporter.sendMail({ to, subject: 'Welcome!' })
    logger.info('Welcome email sent', { to })
  } catch (error) {
    logger.error('Failed to send welcome email', { to, error: error.message })
    throw error
  }
}
```

### In Database Operations

```typescript
import { getLogger } from '@logtape/logtape'

import { LogCategory } from '@/utils/logger'

const logger = getLogger(LogCategory.DATABASE)

export async function findUserById(id: string) {
  const start = Date.now()

  try {
    const user = await prisma.user.findUnique({ where: { id } })
    logger.debug('Query executed', {
      operation: 'findUserById',
      duration: Date.now() - start,
      found: !!user,
    })
    return user
  } catch (error) {
    logger.error('Query failed', { operation: 'findUserById', id, error: error.message })
    throw error
  }
}
```

### With Request Context

Use `withContext` to automatically attach fields to all logs within a request:

```typescript
import { withContext } from '@logtape/logtape'

app.use('*', async (c, next) => {
  await withContext(
    {
      requestId: c.get('requestId'),
      userId: c.get('user')?.id,
    },
    async () => {
      await next()
    },
  )
})
```

Now all logs within that request automatically include `requestId` and `userId`.

---

## Prisma Query Logging

Prisma has its own logging configured in its client initialization (see `packages/database/`):

```typescript
log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
```

This outputs query logs to console in development. To integrate with LogTape, you can use Prisma's event system:

```typescript
import { getLogger } from '@logtape/logtape'

import { LogCategory } from '@/utils/logger'

const logger = getLogger(LogCategory.DATABASE)

prisma.$on('query', (e) => {
  logger.debug('Prisma query', {
    query: e.query,
    params: e.params,
    duration: e.duration,
  })
})
```

---

## HTTP Request Logging

The `@logtape/hono` middleware automatically logs all HTTP requests:

```typescript
// In apps/backend/src/app.ts
app.use(
  honoLogger({
    category: LogCategory.HTTP,
    format: env.APP_ENV === 'local' ? 'dev' : 'combined',
    skip: (c) => c.req.path === '/health',
  }),
)
```

**Formats:**

- `dev` - Concise: `GET /path 200 1.234 ms`
- `combined` - Apache Combined Log Format with structured data

---

## Observability (User Choice)

This starter does **not** include OpenTelemetry or APM by default. Add based on your needs.

### Options

| Tool                | Use Case                               | Package          |
| ------------------- | -------------------------------------- | ---------------- |
| **OpenTelemetry**   | Distributed tracing, metrics, spans    | `@hono/otel`     |
| **Sentry**          | Error tracking, performance monitoring | `@sentry/bun`    |
| **DataDog**         | Full observability platform            | `dd-trace`       |
| **LogTail / Axiom** | Log aggregation with search            | Pipe stdout JSON |
| **CloudWatch**      | AWS-native logging and metrics         | Pipe stdout JSON |
| **Prometheus**      | Metrics collection                     | `prom-client`    |

### Log Aggregation

LogTape outputs JSON Lines in production, which is compatible with all major log aggregation platforms. Simply pipe stdout to your aggregation service.

### Further Reading

- [@hono/otel documentation](https://github.com/honojs/middleware/tree/main/packages/otel)
- [Sentry Bun SDK](https://docs.sentry.io/platforms/javascript/guides/bun/)
- [LogTape sinks](https://logtape.org/manual/sinks) (file, rotating file, OpenTelemetry)

---

## Best Practices

### Do

- Use structured logging with key-value pairs
- Include correlation IDs (requestId) in all logs
- Log at appropriate levels (debug for dev, info for production events)
- Redact sensitive data before logging
- Use specific categories (`LogCategory.AUTH`, `LogCategory.DATABASE`) not just `APP`

### Don't

- Log passwords, tokens, or API keys
- Log full request/response bodies globally
- Use `console.log` in production code (use `getLogger` instead)
- Over-log in hot paths (consider sampling for high-volume operations)

---

## Troubleshooting

### Logs Not Appearing

1. Ensure `configureLogger()` is called before the server starts (see `apps/backend/src/bun.ts`)
2. Check log level - debug logs won't appear in production
3. In tests, logs are silenced by default

### JSON Output in Development

Set `APP_ENV=local` for pretty console output instead of JSON.
