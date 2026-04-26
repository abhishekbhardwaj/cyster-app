import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/**
 * Type-safe environment variables for the backend app.
 *
 * Backend is server-only — no client/prefix split needed.
 * We pass `process.env` directly since there's no build-time inlining concern
 * (unlike Next.js which requires explicit per-var mapping).
 */
export const env = createEnv({
  server: {
    // Environment
    APP_ENV: z.enum(['local', 'test', 'development', 'production']),
    NODE_ENV: z.enum(['development', 'production', 'test']),

    // Application
    APP_NAME: z.string(),
    BASE_APP_URL: z.url(),
    APP_AUTH_SECRET: z.string(),
    BACKOFFICE_INTERNAL_API_SECRET: z.string(),

    // Database
    DATABASE_URL: z.url(),
    DIRECT_DATABASE_URL: z.url(),

    // Email
    SMTP_SERVER: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_USERNAME: z.string(),
    SMTP_PASSWORD: z.string(),
    SMTP_FROM: z.email(),

    // CORS
    TRUSTED_ORIGINS: z.string().optional(),

    // Server
    PORT: z.coerce.number().default(3838),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
