import { env } from '@repo/env/backend'
import { type MiddlewareHandler } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'

import { type HonoContextType } from '@/utils/hono'

/**
 * BearerAuth middleware: https://github.com/honojs/hono/blob/main/src/middleware/bearer-auth/index.ts
 */
const internalBackOfficeAuthenticationMiddleware = bearerAuth({
  token: env.BACKOFFICE_INTERNAL_API_SECRET,
}) as MiddlewareHandler<HonoContextType>

export default internalBackOfficeAuthenticationMiddleware
