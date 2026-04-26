import { prisma, type PrismaType } from '@repo/database'
import { env } from '@repo/env/backend'
import { Hono } from 'hono'
import { type StatusCode } from 'hono/utils/http-status'

import { ResponseCode, RoutePrefix } from '@/utils/constants'
import { type ApiResponse } from '@/utils/hono'
import { generateRoute } from '@/utils/route'

interface CheckType {
  type: 'database'
  message?: string
  status: ResponseCode
}

// Test database connection
const checkDatabase = async (prisma: PrismaType): Promise<CheckType> => {
  try {
    const result = await prisma.$queryRaw<[{ result: number }]>`SELECT 1 as result`
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const healthy = result?.[0].result === 1

    return {
      type: 'database',
      status: healthy ? ResponseCode.SUCCESS : ResponseCode.HEALTH_CHECK_FAILED,
    }
  } catch (error) {
    const appEnv = env.APP_ENV
    return {
      type: 'database',
      status: ResponseCode.HEALTH_CHECK_FAILED,
      ...(appEnv === 'local' || appEnv === 'development'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          { message: (error as any)?.message ?? undefined }
        : {}),
    }
  }
}

const healthRouter = new Hono().get(generateRoute(RoutePrefix.HEALTH, '/'), async (c) => {
  const timestampStart = Date.now()

  const checks: CheckType[] = await Promise.all([
    // all the tools that we want to check
    checkDatabase(prisma),
  ])

  const timestampEnd = Date.now() - timestampStart

  const code = checks.every((check) => check.status === ResponseCode.SUCCESS)
    ? ResponseCode.SUCCESS
    : ResponseCode.HEALTH_CHECK_FAILED

  const status: StatusCode = code === ResponseCode.SUCCESS ? 200 : 500

  return c.json(
    {
      code,
      data: {
        checks,
        time: new Date(),
        response_time: `${timestampEnd}ms`,
      },
    } satisfies ApiResponse<{
      checks: CheckType[]
      time: Date
      response_time: string
    }>,
    status,
  )
})

export default healthRouter
