import { type JSX } from 'react'

import { env } from '@repo/env/backend'
import { render } from 'jsx-email'
import nodemailer, { type SentMessageInfo } from 'nodemailer'

import { type EmailTemplates } from './templates'

// ============================================
// TYPES
// ============================================

export interface SendEmailProps {
  to: string[] | string
  subject: string
  replyTo?: string
  bodyPlainText?: string
  bodyHtml?: string
}

export interface EmailClientConfig {
  host: string
  port: number
  auth: { user: string; pass: string }
  from: string
}

// ============================================
// FACTORY
// ============================================

/**
 * Create an email client with custom SMTP configuration.
 * Use this when you need a client with non-default settings.
 *
 * For the default singleton, import `emailClient` instead.
 */
export const createEmailClient = (config: EmailClientConfig) => {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    auth: config.auth,
    from: config.from,
  })

  const send = async ({ to, subject, bodyHtml, bodyPlainText, replyTo }: SendEmailProps): Promise<SentMessageInfo> =>
    transporter.sendMail({
      from: config.from,
      to,
      replyTo,
      subject: subject,
      text: bodyPlainText,
      html: bodyHtml,
    })

  /**
   * Use JSX Email to style and render email templates.
   * Ref: https://jsx.email/
   */
  const sendAsTemplate = async <T extends keyof EmailTemplates>({
    template,
    props,
    ...baseSendProps
  }: {
    template: (props: EmailTemplates[T]) => JSX.Element
    props: EmailTemplates[T]
  } & Pick<SendEmailProps, 'to' | 'subject' | 'replyTo'>): Promise<SentMessageInfo> => {
    try {
      const renderedTemplate = template(props)
      const [html, plainText] = await Promise.all([
        render(renderedTemplate),
        render(renderedTemplate, { plainText: true }),
      ])

      return send({ ...baseSendProps, bodyHtml: html, bodyPlainText: plainText })
    } catch (error) {
      console.error('Error rendering or sending email template:', error)
      throw error
    }
  }

  return { transporter, send, template: sendAsTemplate }
}

// ============================================
// SINGLETON
// ============================================

/**
 * Default email client singleton, configured from environment variables.
 */
const emailClient = createEmailClient({
  host: env.SMTP_SERVER,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
  from: env.SMTP_FROM,
})

export default emailClient
