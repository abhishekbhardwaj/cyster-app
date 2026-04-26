import { type Context } from 'hono'

import { isUserPartOfOrganization } from '@/services/database/organization-service'
import { ResponseCode } from '@/utils/constants'
import { HttpStatusCodes, type ApiResponse, type HonoContextType } from '@/utils/hono'

interface AccessDenied {
  canAccess: false
  statusCode: typeof HttpStatusCodes.UNAUTHORIZED | typeof HttpStatusCodes.FORBIDDEN
  response: ApiResponse
}

interface AccessGranted {
  canAccess: true
}

type AccessCheckResult = AccessDenied | AccessGranted

export async function checkAccessToOrganization(
  c: Context<HonoContextType>,
  organizationId: string,
): Promise<AccessCheckResult> {
  const authUser = c.get('user')
  const authSession = c.get('session')
  const authOrganization = c.get('organization')

  const accessDenied: AccessDenied = {
    canAccess: false,
    statusCode: HttpStatusCodes.FORBIDDEN,
    response: { code: ResponseCode.CANNOT_ACCESS_ORGANIZATION },
  }

  if (authUser?.id && authSession?.id) {
    const doesUserHaveAccess = await isUserPartOfOrganization({
      prisma: c.get('prisma'),
      organizationId,
      userId: authUser.id,
    })

    if (!doesUserHaveAccess) {
      return accessDenied
    }
  } else if (authOrganization && authOrganization.id !== organizationId) {
    return accessDenied
  } else if (!authOrganization) {
    return {
      canAccess: false,
      statusCode: HttpStatusCodes.UNAUTHORIZED,
      response: { code: ResponseCode.UNAUTHORIZED },
    }
  }

  return { canAccess: true }
}
