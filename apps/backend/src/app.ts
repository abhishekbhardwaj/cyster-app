/**
 * This file should never be called directly from anywhere except from the runtime environment file.
 * A starter file for a Node.js based runtime is available as an example at `./node.ts`.
 */

import { honoLogger } from '@logtape/hono'
import { env } from '@repo/env/backend'
import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { requestId } from 'hono/request-id'
import { secureHeaders } from 'hono/secure-headers'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { type StatusCode } from 'hono/utils/http-status'
import { ZodError } from 'zod'

import BaseException from './exceptions/base-exception'
import ipAddressMiddleware from './middleware/ip-address-middleware'
import prismaMiddleware from './middleware/prisma-middleware'
import appServiceRouter from './routers/app-service/router'
import backofficeRouter from './routers/back-office/router'
import developerRouter from './routers/developer/router'
import healthRouter from './routers/health-router'
import { ResponseCode } from './utils/constants'
import { calculateTrustedInboundOrigins } from './utils/cors'
import {
  convertStatusCodeToResponseCode,
  transformZodIssue,
  type ApiResponse,
  type HonoContextType,
} from './utils/hono'
import { LogCategory } from './utils/logger'

const app = new Hono<HonoContextType>()
  .use(
    '*',
    cors({
      origin: calculateTrustedInboundOrigins(),
      allowHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'Cookie', 'Set-Auth-Token'],
      allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
      exposeHeaders: ['Content-Length', 'Set-Cookie', 'Set-Auth-Token'],
      maxAge: 600,
      credentials: true,
    }),
  )
  .use(
    '*',
    bodyLimit({
      maxSize: 100 * 1024, // 100KB
      onError: (c) => c.json({ code: ResponseCode.PAYLOAD_TOO_LARGE, message: 'Request body too large' }, 413),
    }),
  )
  .use(secureHeaders())
  .use(trimTrailingSlash())
  .use(ipAddressMiddleware)
  .use('*', requestId())
  .use(
    '*',
    honoLogger({
      category: LogCategory.HTTP,
      level: 'info',
      format: env.APP_ENV === 'local' ? 'dev' : 'combined',
      skip: (c) => c.req.path === '/health' || c.req.path === '/health/live',
    }),
  )
  /**
   * Middleware to inject Prisma into the context.
   */
  .use(prismaMiddleware)
  /**
   * Health router before Prisma middleware to avoid Prisma being injected into the context.
   */
  .route('/', healthRouter)
  .route('/', backofficeRouter)
  .route('/', appServiceRouter)
  .route('/', developerRouter)
  .notFound((c) =>
    c.json(
      {
        code: ResponseCode.NOT_FOUND,
        message: 'The requested resource was not found',
      } as ApiResponse,
      404,
    ),
  )
  .onError((e, c) => {
    const errorObject: ApiResponse = {
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      ...((env.APP_ENV === 'local' || env.APP_ENV === 'development') && !!e.message ? { message: e.message } : {}),
    }

    let statusCode: StatusCode = 500

    if (e instanceof ZodError) {
      errorObject.code = ResponseCode.VALIDATION_ERROR
      errorObject.message = e.issues.map((error) => error.message).join('\n')
      errorObject.data = e.issues.map(transformZodIssue)
      statusCode = 400
    } else if (e instanceof BaseException) {
      // BaseException carries a domain-specific `code` - use it directly
      errorObject.code = e.code
      statusCode = e.status
    } else if (e instanceof HTTPException) {
      // https://github.com/honojs/hono/blob/main/src/middleware/bearer-auth/index.ts#L151
      if (e.res?.headers.get('WWW-Authenticate')?.includes('error="invalid_request"')) {
        errorObject.code = ResponseCode.UNAUTHORIZED
        statusCode = 401
        return c.json(errorObject, statusCode)
      }

      errorObject.code = convertStatusCodeToResponseCode(e.status)
      statusCode = e.status
    }

    return c.json(errorObject, statusCode)
  })

export default app
