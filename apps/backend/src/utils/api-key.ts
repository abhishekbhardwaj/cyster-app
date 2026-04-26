import { nanoid } from 'nanoid'

export const createAPIKey = (prefix: 'key' | 'key-dev') => {
  // Base64 can contain +/= which are not URL-safe
  // Most implementations limit bearer tokens to 128 chars for compatibility
  // So we'll keep total length under that with room for "Bearer " prefix
  const randomPart = Buffer.from(nanoid(32)).toString('base64').replace(/[+/=]/g, '')
  const key = `${prefix}-${randomPart}`

  // Ensure total length stays under 120 chars (128 - "Bearer " prefix)
  return key.slice(0, 120)
}
