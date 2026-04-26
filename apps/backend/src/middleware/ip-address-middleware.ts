import { env } from '@repo/env/backend'
import { type MiddlewareHandler } from 'hono'
import { getConnInfo } from 'hono/bun'

import { type HonoContextType } from '@/utils/hono'
import { getClientIp } from '@/utils/ip-address'

const ipAddressMiddleware: MiddlewareHandler<HonoContextType> = async (c, next) => {
  if (env.APP_ENV !== 'test') {
    let ipAddress = getClientIp(c.req.raw)
    ipAddress ??= getConnInfo(c).remote.address ?? null

    c.set('ipAddress', ipAddress)
  } else {
    c.set('ipAddress', '::1')
  }

  await next()
}

export default ipAddressMiddleware
