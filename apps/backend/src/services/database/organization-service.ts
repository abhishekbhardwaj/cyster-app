import { type OrganizationDefaultArgs, type OrganizationGetPayload, type PrismaType } from '@repo/database'

export const OrganizationIncludes = {
  include: {
    members: true,
  },
} satisfies OrganizationDefaultArgs

export type Organization = OrganizationGetPayload<typeof OrganizationIncludes>

/**
 * Checks if a user is part of a specific organization.
 */
export const isUserPartOfOrganization = async ({
  organizationId,
  prisma,
  userId,
}: {
  prisma: PrismaType
  organizationId: string
  userId: string
}) => {
  return prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId,
    },
  })
}
