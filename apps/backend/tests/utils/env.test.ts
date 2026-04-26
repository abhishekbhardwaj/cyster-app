import { env } from '@repo/env/backend'
import { describe, expect, test } from 'bun:test'

describe('Environment Configuration', () => {
  test('should load .env.test values (not .env)', () => {
    // These values come from .env.test
    expect(env.APP_ENV).toBe('test')
    expect(env.NODE_ENV).toBe('test')
  })

  test('should have required env variables set', () => {
    // Verify critical env vars are loaded
    expect(env.APP_NAME).toBeDefined()
    expect(env.BASE_APP_URL).toBeDefined()
    expect(env.DATABASE_URL).toBeDefined()
  })
})
