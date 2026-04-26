import { type Organization, type PrismaType, type User } from '@repo/database'
import { type Hono } from 'hono'
import { pick } from 'lodash'

import { hashPassword } from '@/services/auth'
import { type HonoContextType } from '@/utils/hono'

import { createTestAuthClient } from './create-test-auth-client'

// eslint-disable-next-line sonarjs/no-hardcoded-passwords
export const SamplePassword = 'Password123$'

export const DummyUsers = [
  { name: 'John Doe', email: 'john@doe.com' },
  { name: 'Jane Smith', email: 'jane@smith.com' },
  { name: 'Alice Johnson', email: 'alice.johnson@example.com' },
]

export const DummyOrganizations = [
  { name: 'Acme Inc.', slug: 'acme' },
  { name: 'Globex Corp', slug: 'globex' },
  { name: 'Initech', slug: 'initech' },
] as const

export interface TestData {
  user: User & {
    organizations: Omit<Organization, 'updatedAt'>[]
  }
  betterAuth: ReturnType<typeof createTestAuthClient>
}

export const createBaseData = async (prisma: PrismaType, app: Hono<HonoContextType>): Promise<TestData[]> => {
  const result: TestData[] = []

  // First create all users
  for (const newUser of DummyUsers) {
    const betterAuth = createTestAuthClient(app)

    const userObject = await prisma.user.create({
      data: {
        emailVerified: true,
        name: newUser.name,
        email: newUser.email,
      },
      include: {
        organizations: true,
      },
    })

    await prisma.userAccount.create({
      data: {
        userId: userObject.id,
        accountId: userObject.id,
        providerId: 'credential',
        password: await hashPassword(SamplePassword),
      },
    })

    await betterAuth.signIn.email({
      email: newUser.email,
      password: SamplePassword,
    })

    result.push({ user: { ...userObject, organizations: [] }, betterAuth })
  }

  const organizationSetups: {
    org: (typeof DummyOrganizations)[number]
    members: { user: TestData; role: 'owner' | 'admin' | 'member' }[]
  }[] = [
    { org: DummyOrganizations[0], members: [{ user: result[0]!, role: 'owner' }] }, // Acme - Only John
    {
      org: DummyOrganizations[1],
      members: [
        { user: result[0]!, role: 'owner' },
        { user: result[1]!, role: 'admin' },
      ],
    }, // Globex - John and Jane
    {
      org: DummyOrganizations[2],
      members: [
        { user: result[0]!, role: 'owner' as const },
        ...result.slice(1).map((m) => ({ user: m, role: 'member' as const })),
      ],
    }, // Initech - All users
  ]

  const primaryUser = result[0]!

  for (const setup of organizationSetups) {
    // Create organization
    const org = await primaryUser.betterAuth.organization.create({
      name: setup.org.name,
      slug: setup.org.slug,
    })

    if (org.data) {
      const orgData = pick(org.data, [
        'id',
        'name',
        'slug',
        'logo',
        'metadata',
        'createdAt',
        // 'updatedAt',
      ]) as unknown as Omit<Organization, 'updatedAt'>

      // Add organization to owner's list
      primaryUser.user.organizations.push(orgData)

      // Add members (skip first member since they created the org)
      for (const member of setup.members.slice(1)) {
        const invitation = await primaryUser.betterAuth.organization.inviteMember({
          email: member.user.user.email,
          role: member.role,
        })

        if (invitation.data?.id) {
          await member.user.betterAuth.organization.acceptInvitation({
            invitationId: invitation.data.id,
          })

          // Add organization to member's list
          member.user.user.organizations.push(orgData)
        }
      }
    }
  }

  return result
}
