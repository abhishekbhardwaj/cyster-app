import { env } from '@repo/env/backend'

import { TrustedInboundOrigins } from './constants'

/**
 * Calculate trusted inbound origins from environment and defaults.
 * Set TRUSTED_ORIGINS env var as comma-separated list to add custom origins.
 */
export const calculateTrustedInboundOrigins = (): string[] => {
  const envOrigins =
    env.TRUSTED_ORIGINS?.split(',')
      .map((s) => s.trim())
      .filter(Boolean) ?? []

  return [...new Set([...TrustedInboundOrigins, ...envOrigins])]
}
