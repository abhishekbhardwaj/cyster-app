import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'

import { auth } from '@/services/auth'
import { OpenAPIRoute, RoutePrefix } from '@/utils/constants'
import { defaultHookForZodOpenAPI, type HonoContextType } from '@/utils/hono'
import { generateRoute } from '@/utils/route'

import {
  createOrganizationApiKeyRouteHandler,
  deleteOrganizationApiKeyRouteHandler,
  getOrganizationApiKeysRouteHandler,
} from './organization/api-keys/handler'
import { createApiKeyRoute, deleteApiKeyRoute, getApiKeysRoute } from './organization/api-keys/schema'
import { submitContactForm, submitContactFormHandler } from './static/contact'

const appServiceRouter = new OpenAPIHono<HonoContextType>({
  defaultHook: defaultHookForZodOpenAPI,
})

appServiceRouter
  // Organization API Keys
  .openapi(getApiKeysRoute, getOrganizationApiKeysRouteHandler)
  .openapi(createApiKeyRoute, createOrganizationApiKeyRouteHandler)
  .openapi(deleteApiKeyRoute, deleteOrganizationApiKeyRouteHandler)
  // Static routes
  .openapi(submitContactForm, submitContactFormHandler)
  // OpenAPI Documentation
  .doc31(generateRoute(RoutePrefix.APP_SERVICE, OpenAPIRoute.JSON), {
    openapi: '3.1.0',
    info: {
      title: 'App Service API',
      version: '1.0.0',
      description: 'App service router. Signup, sign in, etc.',
    },
  })
  .get(
    generateRoute(RoutePrefix.APP_SERVICE, OpenAPIRoute.UI),
    Scalar({
      theme: 'elysiajs',
      url: generateRoute(RoutePrefix.APP_SERVICE, OpenAPIRoute.JSON),
      pageTitle: 'App Service API Reference',
    }),
  )
  // Better Auth - Hono.js Integration: https://www.better-auth.com/docs/integrations/hono
  .on(['POST', 'GET'], generateRoute(RoutePrefix.APP_SERVICE, '/auth/**'), (c) => auth.handler(c.req.raw))

appServiceRouter.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
})

export default appServiceRouter
