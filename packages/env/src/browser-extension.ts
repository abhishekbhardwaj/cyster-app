import { createEnv } from '@t3-oss/env-core'

/**
 * Type-safe environment variables for the browser extension.
 *
 * WXT (Vite-based) exposes vars prefixed with WXT_ or VITE_ via import.meta.env.
 * Unlike Next.js, Vite's import.meta.env is a real object at runtime,
 * so we can pass it directly to runtimeEnv.
 */
export const env = createEnv({
  clientPrefix: 'WXT_',
  server: {},
  client: {
    // Add WXT_ prefixed vars here, e.g.:
    // WXT_API_URL: z.string().url(),
  },
  runtimeEnv: import.meta.env,
})
