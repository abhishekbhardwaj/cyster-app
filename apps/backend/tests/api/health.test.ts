import { expect, test } from 'bun:test'
import { testClient } from 'hono/testing'

import app from '@/app'
import { ResponseCode } from '@/utils/constants'

test('test if /health returns ok status', async () => {
  const client = testClient(app)
  const health = await client.health!.$get()

  const response = await health.json()

  expect(health.status).toBe(200)
  expect(response.code).toBe(ResponseCode.SUCCESS)
  expect(response.data).toMatchObject({
    checks: [
      {
        type: 'database',
        status: ResponseCode.SUCCESS,
      },
    ],
  })
  expect(response.data.time).toBeDefined()
  expect(response.data.response_time).toBeDefined()
})
