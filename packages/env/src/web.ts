import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/**
 * Type-safe environment variables for the web app.
 *
 * IMPORTANT — Next.js NEXT_PUBLIC_ mapping:
 * Next.js inlines NEXT_PUBLIC_* vars at build time by replacing each
 * `process.env.NEXT_PUBLIC_X` reference with its literal value. This means
 * you CANNOT use a dynamic lookup like `process.env[key]` — each var must
 * be explicitly referenced as `process.env.NEXT_PUBLIC_X` in `runtimeEnv`.
 *
 * TypeScript enforces this: if you add a key to `client` but forget to map
 * it in `runtimeEnv`, `tsc` will error. This is our compile-time safety net.
 */
export const env = createEnv({
  clientPrefix: 'NEXT_PUBLIC_',
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Add server-side vars here, e.g.:
    // DATABASE_URL: z.string().url(),
  },
  client: {
    // Add NEXT_PUBLIC_ vars here, e.g.:
    // NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    // IMPORTANT: Every key from `server` and `client` above MUST be explicitly
    // mapped here as `KEY: process.env.KEY`. TypeScript will error if you miss one.
    // Do NOT use spread or dynamic access — Next.js build-time inlining requires
    // literal `process.env.NEXT_PUBLIC_*` references.
  },
})
