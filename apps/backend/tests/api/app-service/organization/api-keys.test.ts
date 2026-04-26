import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test'
import { APITestClient } from 'tests/__reusable-test-utilities__/api-test-client'
import { type z } from 'zod'

import app from '@/app'
import { type APIKeySchema } from '@/routers/app-service/organization/api-keys/schema'
import { RoutePrefix } from '@/utils/constants'
import { type ApiResponse } from '@/utils/hono'

type APIKey = z.infer<typeof APIKeySchema>

describe('Organization: API Keys', () => {
  const client = new APITestClient(app)

  beforeAll(async () => await client.setupDatabase())
  beforeEach(async () => await client.truncateDatabaseAndSeed())
  afterAll(async () => await client.teardown())

  test('GET /organization/:id/api-keys - should list API keys', async () => {
    // Given a user in an organization
    const user = client.users[0]!
    const org = user.user.organizations[0]!

    // When fetching API keys
    const response = await client
      .setRequestAsUser(user)
      .request<ApiResponse<APIKey[]>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'GET')

    // Then should receive empty list of API keys
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body?.data)).toBe(true)
    expect(response.body?.data).toHaveLength(0)
  })

  test('GET /organization/:id/api-keys - should mask API keys except last 4 digits', async () => {
    // Given a user in an organization with an API key
    const user = client.users[0]!
    const org = user.user.organizations[0]!

    // Create API key first
    await client
      .setRequestAsUser(user)
      .request<ApiResponse<APIKey>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'POST')

    // When fetching API keys
    const response = await client
      .setRequestAsUser(user)
      .request<ApiResponse<APIKey[]>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'GET')

    // Then API key should be masked
    expect(response.status).toBe(200)
    expect(response.body?.data?.[0]?.key).toMatch(/^\*+[a-zA-Z0-9]{4}$/)
  })

  test('GET /organization/:id/api-keys - should return 404 for non-existent organization', async () => {
    // Given a user and non-existent org ID
    const user = client.users[0]!
    const nonExistentOrgId = 'non-existent-id'

    // When fetching API keys
    const response = await client
      .setRequestAsUser(user)
      .request<ApiResponse>(`${RoutePrefix.APP_SERVICE}/organization/${nonExistentOrgId}/api-keys`, 'GET')

    // Then should receive not found error
    expect(response.status).toBe(404)
  })

  test('POST /organization/:id/api-keys - should create API key', async () => {
    // Given a user in an organization
    const user = client.users[0]!
    const org = user.user.organizations[0]!

    // When creating an API key
    const response = await client
      .setRequestAsUser(user)
      .request<ApiResponse<APIKey>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'POST')

    // Then the API key should be created successfully
    expect(response.status).toBe(200)
    expect(response.body?.data?.id).toBeDefined()
    expect(response.body?.data?.key).toBeDefined()
    expect(response.body?.data?.createdAt).toBeDefined()
    expect(response.body?.data?.updatedAt).toBeDefined()
  })

  test('DELETE /organization/:id/api-keys/:apiKeyId - should delete API key', async () => {
    // Given a user in an organization with an API key
    const user = client.users[0]!
    const org = user.user.organizations[0]!

    const createResponse = await client
      .setRequestAsUser(user)
      .request<ApiResponse<APIKey>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'POST')

    const apiKeyId = createResponse.body?.data?.id

    // When deleting the API key
    const response = await client
      .setRequestAsUser(user)
      .request<ApiResponse>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys/${apiKeyId}`, 'DELETE')

    // Then the API key should be deleted successfully
    expect(response.status).toBe(200)

    // Verify API key is deleted
    const listResponse = await client
      .setRequestAsUser(user)
      .request<ApiResponse<APIKey[]>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'GET')

    expect(listResponse.body?.data).toHaveLength(0)
  })

  test('DELETE /organization/:id/api-keys/:apiKeyId - should return 404 for non-existent API key', async () => {
    // Given a user in an organization
    const user = client.users[0]!
    const org = user.user.organizations[0]!
    const nonExistentApiKeyId = 'non-existent-id'

    // When attempting to delete non-existent API key
    const response = await client
      .setRequestAsUser(user)
      .request<ApiResponse>(
        `${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys/${nonExistentApiKeyId}`,
        'DELETE',
      )

    // Then should receive not found error
    expect(response.status).toBe(404)
  })

  test('Operations should fail for non-organization members', async () => {
    // Given a user not in the organization
    const orgOwner = client.users[0]!
    const nonMember = client.users[2]!
    const org = orgOwner.user.organizations[0]!

    // Test all endpoints
    const endpoints = [
      ['GET', `${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`],
      ['POST', `${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`],
      ['DELETE', `${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys/some-id`],
    ]

    // When trying to access endpoints as non-member
    for (const [method, path] of endpoints) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      const response = await client.setRequestAsUser(nonMember).request<ApiResponse>(path!, method! as any)

      // Then should receive forbidden error (authenticated but not a member of this org)
      expect(response.status).toBe(403)
    }
  })

  test('Operations should work with valid API key authentication', async () => {
    // Given a user in an organization
    const user = client.users[0]!
    const org = user.user.organizations[0]!

    // Create an API key first
    const createResponse = await client
      .setRequestAsUser(user)
      .request<ApiResponse<APIKey>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'POST')

    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const apiKey = createResponse.body?.data?.key!

    // Reset user and set API key for authentication
    client.setRequestAsUser(null)
    client.setAPIKey(apiKey)

    // Test GET endpoint with API key auth
    const getResponse = await client
      .includeAPIKey()
      .request<ApiResponse<APIKey[]>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'GET')
    expect(getResponse.status).toBe(200)
    expect(Array.isArray(getResponse.body?.data)).toBe(true)
    expect(getResponse.body?.data).toHaveLength(1)

    // Test POST endpoint with API key auth
    const postResponse = await client
      .includeAPIKey()
      .request<ApiResponse<APIKey>>(`${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys`, 'POST')
    expect(postResponse.status).toBe(200)
    expect(postResponse.body?.data?.key).toBeDefined()

    // Test DELETE endpoint with API key auth
    const deleteResponse = await client
      .includeAPIKey()
      .request<ApiResponse>(
        `${RoutePrefix.APP_SERVICE}/organization/${org.id}/api-keys/${postResponse.body?.data?.id}`,
        'DELETE',
      )
    expect(deleteResponse.status).toBe(200)
  })
})
