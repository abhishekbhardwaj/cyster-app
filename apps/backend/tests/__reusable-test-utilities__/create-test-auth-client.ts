import { createAuthClient } from 'better-auth/client'
import { organizationClient } from 'better-auth/client/plugins'
import { type Hono } from 'hono'

import { RoutePrefix } from '@/utils/constants'
import { type HonoContextType } from '@/utils/hono'

export const createTestAuthClient = (app: Hono<HonoContextType>) => {
  let cookies = ''

  return createAuthClient({
    fetchOptions: {
      credentials: 'include',
      baseURL: `http://localhost${RoutePrefix.APP_SERVICE}/auth`,
      customFetchImpl: async (input: RequestInfo | URL, init?: RequestInit) => {
        /**
         * This is because we're hijacking the fetch call to the auth service
         * to allow for cookie sharing between the app and auth service.
         *
         * Used via ApiTestClient to make requests to the app service.
         */
        // eslint-disable-next-line sonarjs/no-nested-conditional
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        if (url.includes(`/auth${RoutePrefix.APP_SERVICE}/`)) {
          input = url.replace(`${RoutePrefix.APP_SERVICE}/auth`, '')
        }

        if (cookies) {
          init = init ?? {}
          if (init.headers instanceof Headers) {
            init.headers.set('Cookie', cookies)
          } else {
            init = {
              ...init,
              headers: Array.isArray(init.headers)
                ? Object.fromEntries([...init.headers, ['Cookie', cookies]])
                : { ...(init.headers ?? {}), Cookie: cookies },
            }
          }
        }

        const response = await app.request(input, init)

        const newCookies = response.headers.get('set-cookie')
        if (newCookies) {
          cookies = newCookies
        }

        return response
      },
    },
    plugins: [organizationClient()],
  })
}
