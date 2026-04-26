import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test'
import { emailMocks } from 'tests/__mocks__'
import { APITestClient } from 'tests/__reusable-test-utilities__/api-test-client'
import { createTestAuthClient } from 'tests/__reusable-test-utilities__/create-test-auth-client'
import { SamplePassword } from 'tests/__reusable-test-utilities__/data-seeding'

import app from '@/app'

describe('Authentication: Smoke Test', () => {
  const client = new APITestClient(app)

  beforeAll(async () => await client.setupDatabase())
  beforeEach(async () => await client.truncateDatabaseAndSeed())
  afterAll(async () => await client.teardown())

  test('Sign Up a user and verify that verification email is sent', async () => {
    // Given
    const betterAuth = createTestAuthClient(client.app)

    // When
    await betterAuth.signUp.email({
      email: 'test.user.for.test@gmail.com',
      name: 'Test User',
      password: 'password',
    })

    // Then
    expect(emailMocks.verificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test.user.for.test@gmail.com',
        appName: expect.any(String) as string,
        url: expect.stringContaining('verify-email') as string,
        name: 'Test User',
      }),
    )
  })

  test('Sign in with email/password and verify session details', async () => {
    // Given a seeded user from dummy data
    const { user } = client.users[0]!
    const betterAuth = createTestAuthClient(client.app)

    // When signing in
    const signInResponse = await betterAuth.signIn.email({
      email: user.email,
      password: SamplePassword,
    })

    // Then sign in should succeed
    expect(signInResponse.data?.token).toBeTruthy()
    expect(signInResponse.data?.user.id).toBe(user.id)
    // user.name is string|null (Prisma), response.user.name is string|undefined (better-auth)
    // Type mismatch requires explicit handling - both should be the same string value
    expect(signInResponse.data?.user.name).toBe(user.name ?? undefined)
    expect(signInResponse.data?.user.email).toBe(user.email)

    // And session should be valid
    const session = await betterAuth.getSession()
    expect(session.data?.user).toMatchObject({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    // And organizations should be accessible
    const orgs = await betterAuth.organization.list()

    expect(orgs.data).toHaveLength(3)
    expect(orgs.data?.find((org) => org.slug === 'acme')).toMatchObject({
      name: 'Acme Inc.',
      slug: 'acme',
    })
  })
})
