import email from '@repo/communications/email'
import { prisma } from '@repo/database'
import { env } from '@repo/env/backend'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { bearer, openAPI, organization } from 'better-auth/plugins'
import kebabCase from 'lodash/kebabCase'

import { OpenAPIRoute, RoutePrefix } from '@/utils/constants'
import { calculateTrustedInboundOrigins } from '@/utils/cors'
import { generateId } from '@/utils/id'

export { verifyPassword, hashPassword } from 'better-auth/crypto'

export const createAuth = () =>
  betterAuth({
    appName: env.APP_NAME,
    basePath: `${RoutePrefix.APP_SERVICE}/auth`,
    baseURL: env.BASE_APP_URL,
    secret: env.APP_AUTH_SECRET,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    trustedOrigins: calculateTrustedInboundOrigins(),
    advanced: {
      database: {
        generateId,
      },
      cookiePrefix: kebabCase(env.APP_NAME),
      crossSubDomainCookies: {
        enabled: true,
      },
      defaultCookieAttributes: {
        sameSite: 'none',
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, token }, _request) => {
        // @note - origin whitelisting otherwise its not secure
        const baseFrontendUrl = _request?.headers.get('origin') ?? env.BASE_APP_URL
        await email.resetPassword({
          appName: env.APP_NAME,
          url: `${baseFrontendUrl}/auth/password/reset?token=${token}&email=${user.email}`,
          name: user.name,
          to: user.email,
        })
      },
    },
    // https://www.better-auth.com/docs/concepts/email#verifying-the-email
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ token, user }, _request) => {
        // @note - origin whitelisting otherwise its not secure
        const baseFrontendUrl = _request?.headers.get('origin') ?? env.BASE_APP_URL
        await email.verificationEmail({
          appName: env.APP_NAME,
          url: `${baseFrontendUrl}/auth/verify-email?token=${token}&email=${user.email}`,
          name: user.name,
          to: user.email,
        })
      },
    },
    user: { modelName: 'User' },
    session: { modelName: 'Session' },
    account: { modelName: 'UserAccount' },
    verification: { modelName: 'UserVerification' },
    plugins: [
      bearer({}),
      organization({
        schema: {
          member: { modelName: 'OrganizationMember' },
          organization: { modelName: 'Organization' },
          invitation: { modelName: 'OrganizationInvitation' },
        },
        sendInvitationEmail: async (data, _request) => {
          /**
           * @note @important
           *
           * Feel free to customize this to wherever your frontend is.
           * This is left as an exercise for the reader.
           *
           * Documentation: https://www.better-auth.com/docs/plugins/organization#create-an-organization
           *
           * You may also just choose to automatically accept the invitation if its a valid account. Up to you.
           */
          // @note - origin whitelisting otherwise its not secure
          const baseFrontendUrl = _request?.headers.get('origin') ?? env.BASE_APP_URL
          const _link = `${baseFrontendUrl}/auth/organizations/${data.organization.id}/invitations/${data.id}`

          await email.organizationInvitationEmail({
            appName: env.APP_NAME,
            url: _link,
            to: data.email,
            organizationName: data.organization.name,
          })
        },
      }),
      // Only include the OpenAPI plugin for Auth in non-production environments
      ...(env.APP_ENV === 'production'
        ? []
        : [
            openAPI({
              path: OpenAPIRoute.UI,
            }),
          ]),
      //
    ],
  })

export const auth = createAuth()
