import { describe, expect, test } from 'bun:test'

import { OpenAPIRoute, RoutePrefix } from '@/utils/constants'
import { generateRoute } from '@/utils/route'

describe('route utils', () => {
  describe('generateRoute', () => {
    test('should return the prefix if path is "/"', () => {
      const route = generateRoute(RoutePrefix.HEALTH, '/')
      expect(route).toBe(RoutePrefix.HEALTH)
    })

    test('should combine prefix and path correctly', () => {
      const route = generateRoute(RoutePrefix.APP_SERVICE, '/auth/login')
      expect(route).toBe('/app-service/auth/login')
    })

    test('should remove duplicate slashes in the combined path', () => {
      const route = generateRoute(RoutePrefix.DEVELOPER, '//openapi')
      expect(route).toBe('/openapi')
    })

    test('should not consider "//openapi" as a valid route', () => {
      const route = generateRoute(RoutePrefix.DEVELOPER, '//openapi')
      expect(route).not.toBe('//openapi')
    })

    test('should generate correct route for OpenAPI JSON', () => {
      const route = generateRoute(RoutePrefix.APP_SERVICE, OpenAPIRoute.JSON)
      expect(route).toBe('/app-service/openapi.json')
    })

    test('should generate correct route for OpenAPI UI', () => {
      const route = generateRoute(RoutePrefix.APP_SERVICE, OpenAPIRoute.UI)
      expect(route).toBe('/app-service/openapi')
    })
  })
})
