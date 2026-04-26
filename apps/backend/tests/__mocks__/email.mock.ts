/**
 * Email Service Mocks
 *
 * Provides typed mock functions for the email service.
 * These mocks are registered in preload.ts and can be imported
 * directly in test files for assertions.
 *
 * @example
 * ```typescript
 * import { emailMocks } from 'tests/__mocks__/email.mock'
 *
 * test('should send email', async () => {
 *   await someAction()
 *   expect(emailMocks.contact).toHaveBeenCalledWith({
 *     to: 'test@example.com',
 *     name: 'Test',
 *     email: 'sender@example.com',
 *     message: 'Hello',
 *   })
 * })
 * ```
 */
import { type SendEmailProps } from '@repo/communications/email'
import { mock } from 'bun:test'

// ============================================
// MOCK RESPONSE TYPES
// ============================================

export interface MockEmailResponse {
  accepted: string[]
  rejected: string[]
  response: string
  messageId: string
}

const createMockEmailResponse = (): Promise<MockEmailResponse> =>
  Promise.resolve({
    accepted: ['test@example.com'],
    rejected: [],
    response: '250 Message accepted',
    messageId: '<test-message-id@example.com>',
  })

// ============================================
// TYPED MOCK FUNCTIONS
// ============================================

/**
 * Mock for emailClient.send()
 */
export const mockSend = mock((_props: SendEmailProps & { bodyPlainText?: string; bodyHtml?: string }) =>
  createMockEmailResponse(),
)

/**
 * Mock for emailClient.template()
 */
export const mockTemplate = mock(
  (_props: { template: unknown; props: unknown; to: string | string[]; subject: string; replyTo?: string }) =>
    createMockEmailResponse(),
)

/**
 * Mock for email.contact()
 */
export const mockContact = mock((_props: { to: string; name: string; email: string; message: string }) =>
  createMockEmailResponse(),
)

/**
 * Mock for email.verificationEmail()
 */
export const mockVerificationEmail = mock((_props: { to: string; url: string; name: string }) =>
  createMockEmailResponse(),
)

/**
 * Mock for email.resetPassword()
 */
export const mockResetPassword = mock((_props: { to: string; url: string; name: string }) => createMockEmailResponse())

/**
 * Mock for email.organizationInvitationEmail()
 */
export const mockOrganizationInvitationEmail = mock(
  (_props: { to: string; appName: string; name?: string; organizationName: string; url: string }) =>
    createMockEmailResponse(),
)

/**
 * Mock transporter object
 */
export const mockTransporter = {
  sendMail: mockSend,
}

// ============================================
// AGGREGATED EXPORTS
// ============================================

/**
 * All email mocks in a single object for convenient access.
 *
 * @example
 * ```typescript
 * import { emailMocks } from 'tests/__mocks__/email.mock'
 * expect(emailMocks.contact).toHaveBeenCalled()
 * ```
 */
export const emailMocks = {
  transporter: mockTransporter,
  send: mockSend,
  template: mockTemplate,
  contact: mockContact,
  verificationEmail: mockVerificationEmail,
  resetPassword: mockResetPassword,
  organizationInvitationEmail: mockOrganizationInvitationEmail,
}

/**
 * Email client mock structure (matches @repo/communications/email client export)
 */
export const emailClientMock = {
  transporter: mockTransporter,
  send: mockSend,
  template: mockTemplate,
}

/**
 * Email templates mock structure (matches @repo/communications/email templates export)
 */
export const emailTemplatesMock = {
  contact: mockContact,
  verificationEmail: mockVerificationEmail,
  resetPassword: mockResetPassword,
  organizationInvitationEmail: mockOrganizationInvitationEmail,
}

export default emailMocks
