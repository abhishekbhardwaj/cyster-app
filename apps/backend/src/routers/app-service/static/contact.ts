import { createRoute, z } from '@hono/zod-openapi'
import email from '@repo/communications/email'
import { jsonContentRequired } from 'stoker/openapi/helpers'

import { OpenAPITag, ResponseCode, RoutePrefix } from '@/utils/constants'
import {
  createApiResponseJsonContentWithData,
  createGenericApiResponseJsonContent,
  HttpStatusCodes,
  type ApiResponse,
  type OpenAPIAppRouteHandler,
} from '@/utils/hono'
import { generateRoute } from '@/utils/route'

/**
 * Schema for contact form submission.
 *
 * @property name - Name of the person submitting the contact form
 * @property email - Email address for contact
 * @property message - The message content
 */
export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').describe('Name of the person submitting the contact form'),
  email: z.email().describe('Email address for contact'),
  message: z.string().min(1, 'Message is required').describe('The message content'),
})

export const ContactFormResponseSchema = z.object({
  success: z.boolean().describe('Whether the contact form was submitted successfully'),
})

/**
 * Route configuration for submitting a contact form
 *
 * This endpoint allows users to submit contact form information
 */
export const submitContactForm = createRoute({
  path: generateRoute(RoutePrefix.APP_SERVICE, '/contact'),
  method: 'post',
  summary: 'Submit contact form',
  description: 'Submit contact form information',
  tags: [OpenAPITag.STATIC],
  request: {
    body: jsonContentRequired(ContactFormSchema, 'Contact form submission data'),
  },
  responses: {
    [HttpStatusCodes.OK]: createApiResponseJsonContentWithData(
      ContactFormResponseSchema,
      'Contact form submitted successfully',
    ),
    [HttpStatusCodes.BAD_REQUEST]: createGenericApiResponseJsonContent('Bad request. The provided data is invalid.'),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createGenericApiResponseJsonContent('Internal Server Error'),
  },
})

export const submitContactFormHandler: OpenAPIAppRouteHandler<typeof submitContactForm> = async (c) => {
  const data = c.req.valid('json')

  await email.contact({
    to: 'abhishek@instantlycreative.com',
    name: data.name,
    email: data.email,
    message: data.message,
  })

  return c.json(
    {
      code: ResponseCode.SUCCESS,
      message: 'Contact form submitted successfully',
      data: {
        success: true,
      },
    } satisfies ApiResponse<z.infer<typeof ContactFormResponseSchema>>,
    HttpStatusCodes.OK,
  )
}
