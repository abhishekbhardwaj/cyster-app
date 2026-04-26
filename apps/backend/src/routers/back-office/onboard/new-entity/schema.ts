import { createRoute } from '@hono/zod-openapi'
import { type MiddlewareHandler } from 'hono'
import { some } from 'hono/combine'
import { jsonContentRequired } from 'stoker/openapi/helpers'
import { z } from 'zod'

import internalBackOfficeAuthenticationMiddleware from '@/middleware/internal-back-office-authentication-middleware'
import { ResponseCode, RoutePrefix } from '@/utils/constants'
import {
  createApiResponseJsonContentWithData,
  createGenericApiResponseJsonContent,
  createValidationErrorApiResponseJsonContent,
  HttpStatusCodes,
  type HonoContextType,
} from '@/utils/hono'
import { generateRoute } from '@/utils/route'

export const OrganizationMetadataSchema = z.object({
  email: z.email(),
  phoneNumber: z.string().optional(),
  website: z.url().optional(),
})

export const OnboardNewEntityRequestSchema = z.object({
  // organization
  organization: z.object({
    ...OrganizationMetadataSchema.shape,
    name: z.string().min(1),
    slug: z.string(),
  }),
  // users to add to this organization
  user: z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),
  }),
})

export type OnboardNewEntityRequestSchemaType = z.infer<typeof OnboardNewEntityRequestSchema>

export const OnboardNewEntityResponseSchema = OnboardNewEntityRequestSchema.extend({
  id: z.string(),
  apiKey: z.string(),
  user: OnboardNewEntityRequestSchema.shape.user.extend({
    id: z.string(),
  }),
  organization: OnboardNewEntityRequestSchema.shape.organization
    .omit({ email: true, phoneNumber: true, website: true })
    .extend({
      id: z.string(),
      metadata: OrganizationMetadataSchema,
    }),
})

export type OnboardNewEntityResponseSchemaType = z.infer<typeof OnboardNewEntityResponseSchema>

export const OnboardNewEntityRoute = createRoute({
  path: generateRoute(RoutePrefix.BACKOFFICE, '/onboard/new-entity'),
  method: 'post',
  description: 'Create a new entity through the onboarding process.',
  middleware: some(internalBackOfficeAuthenticationMiddleware) as MiddlewareHandler<HonoContextType>,
  request: {
    body: jsonContentRequired(OnboardNewEntityRequestSchema, 'Onboard request body'),
  },
  responses: {
    [HttpStatusCodes.OK]: createApiResponseJsonContentWithData(
      OnboardNewEntityResponseSchema,
      'Successfully onboarded new entity',
    ),
    [HttpStatusCodes.BAD_REQUEST]: createValidationErrorApiResponseJsonContent('Failed Validation'),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericApiResponseJsonContent(
      'Unauthorized. The provided authentication token is invalid or expired.',
      ResponseCode.UNAUTHORIZED,
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createGenericApiResponseJsonContent(
      'Internal Server Error',
      ResponseCode.INTERNAL_SERVER_ERROR,
    ),
    [HttpStatusCodes.CONFLICT]: createGenericApiResponseJsonContent(
      'Conflict. The provided entity already exists.',
      ResponseCode.RESOURCE_ALREADY_EXISTS,
    ),
  },
})
