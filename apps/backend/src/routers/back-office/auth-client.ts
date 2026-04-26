import { env } from '@repo/env/backend'
import { createAuthClient } from 'better-auth/client'
import { inferAdditionalFields, organizationClient } from 'better-auth/client/plugins'

import { type auth } from '@/services/auth'
import { RoutePrefix } from '@/utils/constants'

export const authClient = createAuthClient({
  fetchOptions: {
    credentials: 'include',
    auth: {
      type: 'Bearer',
      token: env.BACKOFFICE_INTERNAL_API_SECRET,
    },
    baseURL: `${env.BASE_APP_URL}${RoutePrefix.APP_SERVICE}/auth`,
  },
  plugins: [organizationClient(), inferAdditionalFields<typeof auth>()],
})
