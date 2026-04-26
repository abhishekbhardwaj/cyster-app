import { createRoute, z } from '@hono/zod-openapi'
import { type MiddlewareHandler } from 'hono'
import { some } from 'hono/combine'

import organizationApiKeyAuthenticationMiddleware from '@/middleware/organization-api-key-authentication-middleware'
import userSessionAuthenticationMiddleware from '@/middleware/user-session-authentication-middleware'
import { OpenAPITag, RoutePrefix } from '@/utils/constants'
import {
  createApiResponseJsonContentWithData,
  createGenericApiResponseJsonContent,
  HttpStatusCodes,
  type HonoContextType,
} from '@/utils/hono'
import { generateRoute } from '@/utils/route'

export const APIKeySchema = z.object({
  id: z.string(),
  key: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetAPIKeysResponseSchema = z.array(APIKeySchema)

export const getApiKeysRoute = createRoute({
  path: generateRoute(RoutePrefix.APP_SERVICE, '/organization/{id}/api-keys'),
  method: 'get',
  description: 'Retrieve all API keys for a specific user',
  tags: [OpenAPITag.ORGANIZATION_API_KEYS],
  security: [{ Bearer: [] }],
  middleware: some(
    organizationApiKeyAuthenticationMiddleware,
    userSessionAuthenticationMiddleware,
  ) as MiddlewareHandler<HonoContextType>,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: createApiResponseJsonContentWithData(
      GetAPIKeysResponseSchema,
      'API keys retrieved successfully',
    ),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericApiResponseJsonContent(
      'Unauthorized. The provided authentication token is invalid or expired.',
    ),
    [HttpStatusCodes.FORBIDDEN]: createGenericApiResponseJsonContent(
      'Forbidden. You do not have access to this organization.',
    ),
    [HttpStatusCodes.NOT_FOUND]: createGenericApiResponseJsonContent('Organization not found'),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createGenericApiResponseJsonContent('Internal Server Error'),
  },
})

export const createApiKeyRoute = createRoute({
  description: 'Create a new API key for a specific user',
  method: 'post',
  path: generateRoute(RoutePrefix.APP_SERVICE, '/organization/{id}/api-keys'),
  middleware: some(
    organizationApiKeyAuthenticationMiddleware,
    userSessionAuthenticationMiddleware,
  ) as MiddlewareHandler<HonoContextType>,
  security: [{ Bearer: [] }],
  tags: [OpenAPITag.ORGANIZATION_API_KEYS],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: createApiResponseJsonContentWithData(APIKeySchema, 'API key created successfully'),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericApiResponseJsonContent(
      'Unauthorized. The provided authentication token is invalid or expired.',
    ),
    [HttpStatusCodes.FORBIDDEN]: createGenericApiResponseJsonContent(
      'Forbidden. You do not have access to this organization.',
    ),
    [HttpStatusCodes.NOT_FOUND]: createGenericApiResponseJsonContent('User not found'),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createGenericApiResponseJsonContent('Internal Server Error'),
  },
})

export const deleteApiKeyRoute = createRoute({
  description: 'Delete an API key for a specific user',
  method: 'delete',
  path: generateRoute(RoutePrefix.APP_SERVICE, '/organization/{id}/api-keys/{apiKeyId}'),
  middleware: some(
    organizationApiKeyAuthenticationMiddleware,
    userSessionAuthenticationMiddleware,
  ) as MiddlewareHandler<HonoContextType>,
  security: [{ Bearer: [] }],
  tags: [OpenAPITag.ORGANIZATION_API_KEYS],
  request: {
    params: z.object({
      id: z.string(),
      apiKeyId: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: createGenericApiResponseJsonContent('API key deleted successfully'),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericApiResponseJsonContent(
      'Unauthorized. The provided authentication token is invalid or expired.',
    ),
    [HttpStatusCodes.FORBIDDEN]: createGenericApiResponseJsonContent(
      'Forbidden. You do not have access to this organization.',
    ),
    [HttpStatusCodes.NOT_FOUND]: createGenericApiResponseJsonContent('API key or user not found'),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createGenericApiResponseJsonContent('Internal Server Error'),
  },
})
