import { describe, expect, test } from 'bun:test'

import { parsePhoneNumber } from '@/utils/phone-number'

describe('parsePhoneNumber', () => {
  test('should parse US phone numbers correctly', () => {
    expect(parsePhoneNumber('+1 (555) 123-4567')).toEqual({
      countryCode: '1',
      number: '5551234567',
      fullPhoneNumber: '+15551234567',
    })
    expect(parsePhoneNumber('(555) 123-4567')).toBeNull()
  })

  test('should parse Mexican phone numbers correctly', () => {
    expect(parsePhoneNumber('+52 55 1234 5678')).toEqual({
      countryCode: '52',
      number: '5512345678',
      fullPhoneNumber: '+525512345678',
    })
    expect(parsePhoneNumber('55 1234 5678')).toBeNull()
  })

  test('should parse UK phone numbers correctly', () => {
    expect(parsePhoneNumber('+44 20 7123 4567')).toEqual({
      countryCode: '44',
      number: '2071234567',
      fullPhoneNumber: '+442071234567',
    })
    expect(parsePhoneNumber('020 7123 4567')).toBeNull()
  })

  test('should parse Indian phone numbers correctly', () => {
    expect(parsePhoneNumber('+91 98765 43210')).toEqual({
      countryCode: '91',
      number: '9876543210',
      fullPhoneNumber: '+919876543210',
    })
    expect(parsePhoneNumber('98765 43210')).toBeNull()
  })

  test('should parse Australian phone numbers correctly', () => {
    expect(parsePhoneNumber('+61 2 1234 5678')).toEqual({
      countryCode: '61',
      number: '212345678',
      fullPhoneNumber: '+61212345678',
    })
    expect(parsePhoneNumber('02 1234 5678')).toBeNull()
  })

  test('should parse UAE phone numbers correctly', () => {
    expect(parsePhoneNumber('+971 50 123 4567')).toEqual({
      countryCode: '971',
      number: '501234567',
      fullPhoneNumber: '+971501234567',
    })
    expect(parsePhoneNumber('050 123 4567')).toBeNull()
  })

  test('should return null for invalid phone numbers', () => {
    expect(parsePhoneNumber('invalid')).toBeNull()
    expect(parsePhoneNumber('')).toBeNull()
    expect(parsePhoneNumber('123')).toBeNull()
  })
})
