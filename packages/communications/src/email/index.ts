import emailClient from './client'
import emailTemplates from './templates'

export { default as emailClient, createEmailClient, type SendEmailProps, type EmailClientConfig } from './client'
export { default as emailTemplates, type EmailTemplates } from './templates'

// Re-export template component types for consumers
export { type VerificationEmailProps } from './templates/verification-email'
export { type TemplateProps as ResetPasswordProps } from './templates/reset-password'
export { type TemplateProps as ContactProps } from './templates/contact'
export { type TemplateProps as OrganizationInvitationEmailProps } from './templates/organization-invitation-email'

/**
 * Default email service combining the client and all templates.
 * This is the main import for most consumers.
 *
 * @example
 * ```ts
 * import email from '@repo/communications/email'
 *
 * await email.verificationEmail({ to: 'user@example.com', ... })
 * await email.send({ to: 'user@example.com', subject: '...', bodyHtml: '...' })
 * ```
 */
const email = {
  ...emailClient,
  ...emailTemplates,
}

export default email
