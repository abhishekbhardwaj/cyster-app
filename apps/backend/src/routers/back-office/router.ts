import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'

import { OpenAPIRoute, RoutePrefix } from '@/utils/constants'
import { defaultHookForZodOpenAPI, type HonoContextType } from '@/utils/hono'
import { generateRoute } from '@/utils/route'

import { postOnboardNewEntityRouteHandler } from './onboard/new-entity/handler'
import { OnboardNewEntityRoute } from './onboard/new-entity/schema'

const backofficeRouter = new OpenAPIHono<HonoContextType>({
  defaultHook: defaultHookForZodOpenAPI,
})

backofficeRouter
  .openapi(OnboardNewEntityRoute, postOnboardNewEntityRouteHandler)
  .doc31(generateRoute(RoutePrefix.BACKOFFICE, OpenAPIRoute.JSON), {
    openapi: '3.1.0',
    info: {
      title: 'Backoffice API',
      version: '1.0.0',
      description:
        'Administrative API endpoints for internally managing platform settings, users, content and configurations etc.',
    },
  })
  .get(
    generateRoute(RoutePrefix.BACKOFFICE, OpenAPIRoute.UI),
    Scalar({
      theme: 'elysiajs',
      url: generateRoute(RoutePrefix.BACKOFFICE, OpenAPIRoute.JSON),
      pageTitle: 'Backoffice API Reference',
    }),
  )

backofficeRouter.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
})

export default backofficeRouter
