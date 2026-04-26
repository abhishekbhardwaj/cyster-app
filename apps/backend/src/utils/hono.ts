import { type HttpBindings } from '@hono/node-server'
import { z, type Hook, type RouteConfig, type RouteHandler } from '@hono/zod-openapi'
import { type PrismaType } from '@repo/database'
import { type env } from '@repo/env/backend'
import { type Context } from 'hono'
import { createFactory } from 'hono/factory'
import { type RequestIdVariables } from 'hono/request-id'
import { type StatusCode } from 'hono/utils/http-status'
import { jsonContent } from 'stoker/openapi/helpers'
import { type ZodError } from 'zod'

import { type auth } from '@/services/auth'

import { ResponseCode } from './constants'

export * as HttpStatusCodes from 'stoker/http-status-codes'

export type HonoBindings = HttpBindings & typeof env

export type HonoVariables = RequestIdVariables & {
  prisma: PrismaType
  ipAddress: string | null
  ///////////////////////////////////////////////////
  // ------------------------------------------------
  // Authenticated User // Session // Organization
  // ------------------------------------------------
  // * Mostly used in the context of App Service Router.
  // * The Developer Router uses organization.
  ///////////////////////////////////////////////////
  user?: typeof auth.$Infer.Session.user | null
  session?: typeof auth.$Infer.Session.session | null
  organization?: typeof auth.$Infer.Organization | null
}

export interface HonoContextType {
  Bindings: HonoBindings
  Variables: HonoVariables
}

export type HonoContext = Context<HonoContextType>

export type OpenAPIAppRouteHandler<TRouteConfig extends RouteConfig> = RouteHandler<TRouteConfig, HonoContextType>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultHookForZodOpenAPI: Hook<any, HonoContextType, any, any> = (result, c) => {
  if (result.success) return

  return c.json(
    {
      code: ResponseCode.VALIDATION_ERROR,
      message: result.error.issues.map((error) => error.message).join('\n'),
      data: result.error.issues.map(transformZodIssue),
    } as ApiResponse<ValidationError[]>,
    400,
  )
}

// We can create an App Factory once and use that everywhere: https://hono.dev/docs/helpers/factory#factory-createapp
export const honoFactory = createFactory<HonoContextType>()

/**
 * Schema for API response structure.
 */
export const ApiResponseSchema = z.object({
  code: z.enum(ResponseCode),
  message: z.string().optional(),
  data: z.unknown().optional(),
})

/**
 * Type for API response with generic data.
 */
export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & {
  data?: T
}

/**
 * Creates a generic API response JSON content.
 */
export const createGenericApiResponseJsonContent = (description: string, defaultResponseCode = ResponseCode.SUCCESS) =>
  jsonContent(
    ApiResponseSchema.extend({
      code: z
        .enum(ResponseCode)
        .openapi({ type: 'string', enum: Object.values(ResponseCode) })
        .default(defaultResponseCode),
    }),
    description,
  )

/**
 * Simplified validation error type for API responses
 */
export interface ValidationError {
  code: string
  message: string
  path: (string | number)[]
  field?: string
}

/**
 * Transforms ZodIssue objects into a simplified validation error format
 */
export const transformZodIssue = (issue: ZodError['issues'][0]): ValidationError => {
  return {
    code: issue.code,
    message: issue.message,
    path: issue.path.filter((p): p is string | number => typeof p === 'string' || typeof p === 'number'),
    field: issue.path.length > 0 ? issue.path.join('.') : undefined,
  }
}

export const createValidationErrorApiResponseJsonContent = (description: string) =>
  jsonContent(
    ApiResponseSchema.extend({
      code: z
        .enum(ResponseCode)
        .openapi({ type: 'string', enum: Object.values(ResponseCode) })
        .default(ResponseCode.VALIDATION_ERROR),
      data: z.array(z.custom<ValidationError>().openapi({ type: 'object' })).optional(),
    }),
    description,
  )

/**
 * Creates an API response JSON content with data.
 */
export const createApiResponseJsonContentWithData = <T>(schema: z.ZodType<T>, description: string) =>
  jsonContent(
    ApiResponseSchema.extend({
      data: schema,
    }),
    description,
  )

export const convertStatusCodeToResponseCode = (statusCode: StatusCode): ResponseCode => {
  switch (statusCode) {
    case 400:
      return ResponseCode.BAD_REQUEST
    case 401:
      return ResponseCode.UNAUTHORIZED
    case 403:
      return ResponseCode.FORBIDDEN
    case 404:
      return ResponseCode.NOT_FOUND
    case 409:
      return ResponseCode.RESOURCE_ALREADY_EXISTS
    case 413:
      return ResponseCode.PAYLOAD_TOO_LARGE
    case 422:
      return ResponseCode.VALIDATION_ERROR
    case 500:
    default:
      return ResponseCode.INTERNAL_SERVER_ERROR
  }
}
