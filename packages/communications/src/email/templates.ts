import { type SentMessageInfo } from 'nodemailer'

import emailClient, { type SendEmailProps } from './client'
import { Template as ContactTemplate, type TemplateProps as ContactProps } from './templates/contact'
import {
  Template as OrganizationInvitationEmailTemplate,
  type TemplateProps as OrganizationInvitationEmailProps,
} from './templates/organization-invitation-email'
import { Template as ResetPasswordTemplate, type TemplateProps as ResetPasswordProps } from './templates/reset-password'
import { Template as VerificationEmailTemplate, type VerificationEmailProps } from './templates/verification-email'

export interface EmailTemplates {
  verificationEmail: VerificationEmailProps
  resetPassword: ResetPasswordProps
  contact: ContactProps
  organizationInvitationEmail: OrganizationInvitationEmailProps
}

// Utility type to convert a union type to an intersection type
type UnionToIntersection<U = unknown> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

// 1. Define the function signature type for a generic template key K
type EmailTemplateFunction<K extends keyof EmailTemplates> = (
  props: Pick<SendEmailProps, 'to'> & EmailTemplates[K],
) => ReturnType<typeof emailClient.template<K>>

// 2. Create a mapped type that results in a union of single-property objects
type EmailTemplateObjectsUnion = {
  [K in keyof EmailTemplates]: Record<K, EmailTemplateFunction<K>>
}[keyof EmailTemplates]

const emailTemplates: UnionToIntersection<EmailTemplateObjectsUnion> = {
  verificationEmail: async (props: Pick<SendEmailProps, 'to'> & VerificationEmailProps): Promise<SentMessageInfo> => {
    return emailClient.template<'verificationEmail'>({
      template: VerificationEmailTemplate,
      props,
      to: props.to,
      subject: 'Verify your email address',
    })
  },
  resetPassword: async (props: Pick<SendEmailProps, 'to'> & ResetPasswordProps): Promise<SentMessageInfo> => {
    return emailClient.template<'resetPassword'>({
      template: ResetPasswordTemplate,
      props,
      to: props.to,
      subject: 'Reset your password',
    })
  },
  contact: async (props: Pick<SendEmailProps, 'to'> & ContactProps): Promise<SentMessageInfo> => {
    return emailClient.template<'contact'>({
      template: ContactTemplate,
      props,
      to: props.to,
      subject: 'New contact form submission',
    })
  },
  organizationInvitationEmail: async (
    props: Pick<SendEmailProps, 'to'> & OrganizationInvitationEmailProps,
  ): Promise<SentMessageInfo> => {
    return emailClient.template<'organizationInvitationEmail'>({
      template: OrganizationInvitationEmailTemplate,
      props,
      to: props.to,
      subject: `You've been invited to join ${props.organizationName}`,
    })
  },
}

export default emailTemplates
