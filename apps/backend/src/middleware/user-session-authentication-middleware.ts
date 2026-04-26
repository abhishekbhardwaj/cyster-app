import { createMiddleware } from 'hono/factory'

import AuthenticationException from '@/exceptions/authentication-exception'
import { auth } from '@/services/auth'
import { type HonoContextType } from '@/utils/hono'

const userSessionAuthenticationMiddleware = createMiddleware<HonoContextType>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set('user', null)
    c.set('session', null)

    throw new AuthenticationException()
  }

  c.set('user', session.user)
  c.set('session', session.session)

  await next()
})

export default userSessionAuthenticationMiddleware
