/**
 * Test Preload File
 *
 * This file runs before all tests (configured in bunfig.toml).
 * It sets up:
 * - Module mocks via mock.module()
 * - Global cleanup between tests
 *
 * Environment variables are loaded via `--env-file .env.test` flag
 * in package.json test scripts (Bun's built-in env loading).
 *
 * @see https://bun.sh/docs/test/mocks for mock.module() documentation
 * @see tests/__mocks__/ for mock implementations
 */
import { afterEach, mock } from 'bun:test'

import { emailClientMock, emailMocks, emailTemplatesMock } from './__mocks__/email.mock'

// ============================================
// MODULE MOCKS
// ============================================

/**
 * Mock the email client module.
 */
// mock.module is synchronous in bun:test despite the type signature
// eslint-disable-next-line @typescript-eslint/no-floating-promises
mock.module('@repo/communications/email', () => ({
  default: emailMocks,
  emailClient: emailClientMock,
  emailTemplates: emailTemplatesMock,
}))

// ============================================
// GLOBAL CLEANUP
// ============================================

/**
 * Clear all mock call history after each test.
 * This ensures test isolation - each test starts fresh.
 */
afterEach(() => {
  mock.clearAllMocks()
})
