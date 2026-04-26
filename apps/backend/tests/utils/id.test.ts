import { describe, expect, test } from 'bun:test'

import { generateApiKeyId, generateId, generateIdempotencyKey } from '@/utils/id'

describe('id utils', () => {
  describe('generateId', () => {
    test('should generate a unique id', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    test('should generate unique ids on each call', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateApiKeyId', () => {
    test('should generate a unique api key id', () => {
      const id = generateApiKeyId()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('generateIdempotencyKey', () => {
    test('should generate a unique idempotency key', () => {
      const id = generateIdempotencyKey()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })
  })
})
