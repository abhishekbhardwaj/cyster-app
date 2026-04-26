/**
 * Central export point for all test mocks.
 *
 * Import mocks from this file for test assertions:
 * @example
 * ```typescript
 * import { emailMocks } from 'tests/__mocks__'
 *
 * expect(emailMocks.verificationEmail).toHaveBeenCalled()
 * ```
 *
 * Mocks are registered via mock.module() in tests/preload.ts
 * which runs before all tests (configured in bunfig.toml).
 */

export {
  emailClientMock,
  emailMocks,
  emailTemplatesMock,
  mockContact,
  mockOrganizationInvitationEmail,
  mockResetPassword,
  mockSend,
  mockTemplate,
  mockTransporter,
  mockVerificationEmail,
  type MockEmailResponse,
} from './email.mock'
