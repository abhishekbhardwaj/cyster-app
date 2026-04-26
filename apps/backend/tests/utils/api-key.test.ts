import { describe, expect, test } from 'bun:test'

import { createAPIKey } from '@/utils/api-key'

describe('api-key utils', () => {
  describe('createAPIKey', () => {
    test('should generate an API key with key prefix', () => {
      const key = createAPIKey('key')
      expect(typeof key).toBe('string')
      expect(key).toMatch(/^key-[A-Za-z0-9]+$/) // Removed +/= since they are replaced
    })

    test('should generate an API key with key-dev prefix', () => {
      const key = createAPIKey('key-dev')
      expect(typeof key).toBe('string')
      expect(key).toMatch(/^key-dev-[A-Za-z0-9]+$/) // Removed +/= since they are replaced
    })

    test('should stay under 120 characters', () => {
      const key = createAPIKey('key')
      expect(key.length).toBeLessThanOrEqual(120)
    })
  })
})
