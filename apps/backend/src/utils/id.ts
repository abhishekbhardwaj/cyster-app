import { init } from '@paralleldrive/cuid2'

// Pre-initialized generators (created once at module load, not on every call)
const generators = {
  id: init({ fingerprint: 'id' }),
  'api-key': init({ fingerprint: 'api-key' }),
  'idempotency-key': init({ fingerprint: 'idempotency-key' }),
} as const

/** Generate a unique ID (general purpose) */
export const generateId = () => generators.id()

/** Generate a unique API key ID */
export const generateApiKeyId = () => generators['api-key']()

/** Generate a unique idempotency key */
export const generateIdempotencyKey = () => generators['idempotency-key']()
