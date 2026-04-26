import { timingSafeEqual } from 'node:crypto'

import { prisma } from '@repo/database'
import { type MiddlewareHandler } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'

import { ApiKeyIncludes } from '@/services/database/api-keys-service'
import { type HonoContext, type HonoContextType } from '@/utils/hono'

/**
 * BearerAuth middleware: https://github.com/honojs/hono/blob/main/src/middleware/bearer-auth/index.ts
 */
const organizationApiKeyAuthenticationMiddleware = bearerAuth({
  verifyToken: async (incomingToken, c: HonoContext) => {
    const apiToken = await prisma.apiKey.findUnique({
      where: { key: incomingToken },
      ...ApiKeyIncludes,
    })

    // Use constant-time comparison to prevent timing attacks
    const isValidKey =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      apiToken?.key?.length === incomingToken.length &&
      timingSafeEqual(Buffer.from(apiToken.key, 'utf8'), Buffer.from(incomingToken, 'utf8'))

    if (isValidKey && !!apiToken.organization.id) {
      c.set('organization', apiToken.organization)
      return true
    }

    c.set('organization', null)
    return false
  },
}) as MiddlewareHandler<HonoContextType>

export default organizationApiKeyAuthenticationMiddleware
