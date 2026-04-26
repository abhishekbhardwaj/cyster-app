import { type z } from '@hono/zod-openapi'
import { env } from '@repo/env/backend'
import { hashPassword } from 'better-auth/crypto'

import { ResponseCode, RoutePrefix } from '@/utils/constants'
import { HttpStatusCodes, type ApiResponse, type OpenAPIAppRouteHandler } from '@/utils/hono'
import { generateRoute } from '@/utils/route'

import { authClient } from '../../auth-client'
import {
  type OnboardNewEntityResponseSchemaType,
  type OnboardNewEntityRoute,
  type OrganizationMetadataSchema,
} from './schema'

export const postOnboardNewEntityRouteHandler: OpenAPIAppRouteHandler<typeof OnboardNewEntityRoute> = async (c) => {
  const input = c.req.valid('json')
  const prisma = c.get('prisma')

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.user.email },
  })

  if (existingUser) {
    return c.json({ code: ResponseCode.RESOURCE_ALREADY_EXISTS } as ApiResponse, HttpStatusCodes.CONFLICT)
  }

  const existingOrganization = await prisma.organization.findFirst({
    where: { slug: input.organization.slug },
  })

  if (existingOrganization) {
    return c.json({ code: ResponseCode.RESOURCE_ALREADY_EXISTS } as ApiResponse, HttpStatusCodes.CONFLICT)
  }

  const userObject = await prisma.user.create({
    data: {
      emailVerified: true,
      name: input.user.name,
      email: input.user.email,
    },
    include: {
      organizations: true,
    },
  })

  await prisma.userAccount.create({
    data: {
      userId: userObject.id,
      accountId: userObject.id,
      providerId: 'credential',
      password: await hashPassword(input.user.password),
    },
  })

  const sessionHeaders = new Headers()
  await authClient.signIn.email(
    {
      email: input.user.email,
      password: input.user.password,
    },
    {
      onSuccess(context) {
        sessionHeaders.set('Cookie', context.response.headers.get('set-cookie') ?? '')
      },
    },
  )

  const organization = await authClient.organization.create(
    {
      name: input.organization.name,
      slug: input.organization.slug,
      metadata: {
        email: input.organization.email,
        phoneNumber: input.organization.phoneNumber,
        website: input.organization.website,
      },
    },
    {
      headers: sessionHeaders,
    },
  )

  if (!organization.data) {
    return c.json({ code: ResponseCode.INTERNAL_SERVER_ERROR } as ApiResponse, HttpStatusCodes.INTERNAL_SERVER_ERROR)
  }

  const apiKey = await fetch(
    `${env.BASE_APP_URL}${generateRoute(RoutePrefix.APP_SERVICE, '/organization/{id}/api-keys').replace(
      '{id}',
      organization.data.id,
    )}`,
    {
      method: 'POST',
      headers: {
        Cookie: sessionHeaders.get('Cookie') ?? '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  )

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,
  const apiKeyResponse = await apiKey.json()

  await authClient.signOut({
    fetchOptions: { headers: sessionHeaders },
  })

  return c.json(
    {
      code: ResponseCode.SUCCESS,
      data: {
        id: organization.data.id,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-condition
        apiKey: ((apiKeyResponse as any)?.data?.key as unknown as string) ?? undefined,
        organization: {
          id: organization.data.id,
          name: input.organization.name,
          slug: organization.data.slug,
          metadata: organization.data.metadata as z.infer<typeof OrganizationMetadataSchema>,
        },
        user: {
          id: userObject.id,
          name: userObject.name,
          email: userObject.email,
          password: input.user.password,
        },
      } as OnboardNewEntityResponseSchemaType,
    } satisfies ApiResponse,
    HttpStatusCodes.OK,
  )
}
