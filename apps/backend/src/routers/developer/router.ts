import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'

import { OpenAPIRoute, RoutePrefix } from '@/utils/constants'
import { defaultHookForZodOpenAPI, type HonoContextType } from '@/utils/hono'
import { generateRoute } from '@/utils/route'

const developerRouter = new OpenAPIHono<HonoContextType>({
  defaultHook: defaultHookForZodOpenAPI,
})

developerRouter
  .doc31(generateRoute(RoutePrefix.DEVELOPER, OpenAPIRoute.JSON), {
    openapi: '3.1.0',
    info: {
      title: 'Developer API',
      version: '1.0.0',
      description: 'Developer API endpoints for integrating with platform services and features',
    },
  })
  .get(
    generateRoute(RoutePrefix.DEVELOPER, OpenAPIRoute.UI),
    Scalar({
      theme: 'elysiajs',
      url: generateRoute(RoutePrefix.DEVELOPER, OpenAPIRoute.JSON),
      pageTitle: 'Developer API Reference',
    }),
  )

developerRouter.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
})

export default developerRouter
