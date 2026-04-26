import { env } from '@repo/env/backend'
import libphonenumber from 'google-libphonenumber'

export interface ParsedPhoneNumber {
  countryCode: string
  number: string
  fullPhoneNumber: string
}

export function parsePhoneNumber(phoneNumber: string): ParsedPhoneNumber | null {
  try {
    const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance()
    const parsedNumber = phoneUtil.parse(phoneNumber)

    const countryCode = parsedNumber.getCountryCode()?.toString()
    if (!countryCode) return null

    // Use E164 format to get clean digits, then remove the country code prefix
    const fullNumber = phoneUtil.format(parsedNumber, libphonenumber.PhoneNumberFormat.E164)
    const number = fullNumber.slice(countryCode.length + 1) // +1 for the '+' prefix

    return { countryCode, number, fullPhoneNumber: fullNumber }
  } catch (e) {
    if (env.NODE_ENV !== 'test') {
      console.error('parsePhoneNumber.error', e)
    }
    return null
  }
}
