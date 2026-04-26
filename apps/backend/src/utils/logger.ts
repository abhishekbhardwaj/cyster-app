/**
 * LogTape Configuration
 *
 * This module configures structured logging using LogTape.
 * LogTape is a zero-dependency, universal-runtime logging library.
 *
 * Usage in handlers:
 * ```typescript
 * import { getLogger } from '@logtape/logtape'
 *
 * const logger = getLogger(['my-app', 'my-module'])
 * logger.info('User logged in', { userId: 123 })
 * ```
 *
 * The requestId is automatically attached via withContext middleware.
 */

import {
  configure,
  getAnsiColorFormatter,
  getConsoleSink,
  getLogger,
  jsonLinesFormatter,
  type ConsoleSinkOptions,
} from '@logtape/logtape'
import { env } from '@repo/env/backend'

/**
 * Logger category keys. Add new categories here.
 */
type LogCategoryKey = 'HTTP' | 'APP' | 'DATABASE' | 'AUTH' | 'EMAIL'

/**
 * Logger categories used throughout the application.
 * Using hierarchical categories allows fine-grained log level control.
 *
 * Note: Can't use a traditional enum since LogTape expects string[].
 */
export const LogCategory: Record<LogCategoryKey, string[]> = {
  /** HTTP request/response logging (used by @logtape/hono) */
  HTTP: ['http'],
  /** Application-level logging */
  APP: ['app'],
  /** Database operations */
  DATABASE: ['app', 'database'],
  /** Authentication operations */
  AUTH: ['app', 'auth'],
  /** Email service operations */
  EMAIL: ['app', 'email'],
}

/**
 * Get console sink options based on environment.
 * - Development: Pretty colored output
 * - Production: JSON lines for log aggregation
 * - Test: Disabled
 */
function getConsoleSinkOptions(): ConsoleSinkOptions {
  const appEnv = env.APP_ENV

  if (appEnv === 'test') {
    // Silence logs in tests (can be overridden per-test if needed)
    return { formatter: () => '' }
  }

  if (appEnv === 'local') {
    // Pretty output for local development
    return { formatter: getAnsiColorFormatter() }
  }

  // JSON lines for production/staging - pipe to log aggregator
  return { formatter: jsonLinesFormatter }
}

/**
 * Configure LogTape. Must be called before using any loggers.
 * This is idempotent - calling multiple times is safe.
 */
let configured = false

export async function configureLogger(): Promise<void> {
  if (configured) return
  configured = true

  const appEnv = env.APP_ENV
  const isTest = appEnv === 'test'

  // Determine app log level based on environment
  let appLogLevel: 'fatal' | 'debug' | 'info' = 'info'
  if (isTest) {
    appLogLevel = 'fatal'
  } else if (appEnv === 'local') {
    appLogLevel = 'debug'
  }

  await configure({
    sinks: {
      console: getConsoleSink(getConsoleSinkOptions()),
    },
    loggers: [
      // LogTape internal meta logger - only log warnings/errors
      {
        category: ['logtape', 'meta'],
        sinks: ['console'],
        lowestLevel: 'warning',
      },
      // HTTP request logging (from @logtape/hono)
      {
        category: LogCategory.HTTP,
        sinks: ['console'],
        lowestLevel: isTest ? 'fatal' : 'info',
      },
      // Application logging
      {
        category: LogCategory.APP,
        sinks: ['console'],
        lowestLevel: appLogLevel,
      },
    ],
  })
}

/**
 * Get a logger for application-level logging.
 * Prefer using specific categories from LogCategory for better filtering.
 *
 * @example
 * ```typescript
 * const logger = getAppLogger()
 * logger.info('Application started')
 *
 * // Or with sub-category
 * const dbLogger = getLogger(LogCategory.DB)
 * dbLogger.debug('Query executed', { query, duration })
 * ```
 */
export function getAppLogger() {
  return getLogger(LogCategory.APP)
}

// Re-export getLogger for direct category access
export { getLogger }
