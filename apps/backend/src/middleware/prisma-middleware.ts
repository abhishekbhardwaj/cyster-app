import { prisma } from '@repo/database'
import { type MiddlewareHandler } from 'hono'

import { type HonoContextType } from '@/utils/hono'

const prismaMiddleware: MiddlewareHandler<HonoContextType> = async (c, next) => {
  c.set('prisma', prisma)
  await next()
}

export default prismaMiddleware
