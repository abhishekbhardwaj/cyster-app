import { env } from '@repo/env/backend'

import { OrganizationIncludes } from '@/services/database/organization-service'
import { createAPIKey } from '@/utils/api-key'
import { ResponseCode } from '@/utils/constants'
import { HttpStatusCodes, type ApiResponse, type OpenAPIAppRouteHandler } from '@/utils/hono'

import { checkAccessToOrganization } from '../../access-utilities'
import {
  APIKeySchema,
  GetAPIKeysResponseSchema,
  type createApiKeyRoute,
  type deleteApiKeyRoute,
  type getApiKeysRoute,
} from './schema'

export const getOrganizationApiKeysRouteHandler: OpenAPIAppRouteHandler<typeof getApiKeysRoute> = async (c) => {
  const { id } = c.req.valid('param')

  const organization = await c.get('prisma').organization.findFirst({
    where: { id },
    ...OrganizationIncludes,
  })

  if (!organization) {
    return c.json(
      {
        code: ResponseCode.ORGANIZATION_NOT_FOUND,
      } as ApiResponse,
      HttpStatusCodes.NOT_FOUND,
    )
  }

  const accessCheck = await checkAccessToOrganization(c, organization.id)

  if (!accessCheck.canAccess) {
    return c.json(accessCheck.response, accessCheck.statusCode)
  }

  const apiKeys = await c.get('prisma').apiKey.findMany({
    where: { organizationId: organization.id },
  })

  const parsedApiKeys = await GetAPIKeysResponseSchema.parseAsync(apiKeys)
  return c.json(
    {
      code: ResponseCode.SUCCESS,
      data: parsedApiKeys.map((apiKey) => ({
        ...apiKey,
        key: '*'.repeat(apiKey.key.length - 4) + apiKey.key.slice(-4),
      })),
    } satisfies ApiResponse,
    HttpStatusCodes.OK,
  )
}

export const createOrganizationApiKeyRouteHandler: OpenAPIAppRouteHandler<typeof createApiKeyRoute> = async (c) => {
  const { id } = c.req.valid('param')

  const organization = await c.get('prisma').organization.findFirst({
    where: { id },
    ...OrganizationIncludes,
  })

  if (!organization) {
    return c.json(
      {
        code: ResponseCode.ORGANIZATION_NOT_FOUND,
      } as ApiResponse,
      HttpStatusCodes.NOT_FOUND,
    )
  }

  const accessCheck = await checkAccessToOrganization(c, organization.id)

  if (!accessCheck.canAccess) {
    return c.json(accessCheck.response, accessCheck.statusCode)
  }

  const createdByUserId = c.get('user')?.id ?? organization.members[0]?.userId
  if (!createdByUserId) {
    return c.json(
      {
        code: ResponseCode.UNAUTHORIZED,
      } as ApiResponse,
      HttpStatusCodes.UNAUTHORIZED,
    )
  }

  const apiKey = await c.get('prisma').apiKey.create({
    data: {
      key: createAPIKey(env.APP_ENV === 'production' ? 'key' : 'key-dev'),
      organizationId: organization.id,
      createdByUserId,
    },
  })

  const parsedApiKey = await APIKeySchema.parseAsync(apiKey)
  return c.json(
    {
      code: ResponseCode.SUCCESS,
      data: parsedApiKey,
    } satisfies ApiResponse,
    HttpStatusCodes.OK,
  )
}

export const deleteOrganizationApiKeyRouteHandler: OpenAPIAppRouteHandler<typeof deleteApiKeyRoute> = async (c) => {
  const { id, apiKeyId } = c.req.valid('param')

  const organization = await c.get('prisma').organization.findFirst({
    where: { id },
    ...OrganizationIncludes,
  })

  if (!organization) {
    return c.json(
      {
        code: ResponseCode.ORGANIZATION_NOT_FOUND,
      } as ApiResponse,
      HttpStatusCodes.NOT_FOUND,
    )
  }

  const accessCheck = await checkAccessToOrganization(c, organization.id)

  if (!accessCheck.canAccess) {
    return c.json(accessCheck.response, accessCheck.statusCode)
  }

  const apiKey = await c.get('prisma').apiKey.findFirst({
    where: {
      id: apiKeyId,
      organizationId: organization.id,
    },
  })

  if (!apiKey) {
    return c.json(
      {
        code: ResponseCode.API_KEY_NOT_FOUND,
      } as ApiResponse,
      HttpStatusCodes.NOT_FOUND,
    )
  }

  await c.get('prisma').apiKey.delete({
    where: {
      id: apiKeyId,
    },
  })

  return c.json(
    {
      code: ResponseCode.SUCCESS,
    } as ApiResponse,
    HttpStatusCodes.OK,
  )
}
