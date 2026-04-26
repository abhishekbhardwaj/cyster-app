import { Body, Container, Head, Hr, Html, Link, Preview, Section, Text } from 'jsx-email'

export interface TemplateProps {
  email: string
  name: string
  message: string
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  marginBottom: '64px',
  padding: '20px 0 48px',
}

const box = {
  padding: '0 48px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const paragraph = {
  color: '#777',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
}

const anchor = {
  color: '#777',
}

const messageBox = {
  backgroundColor: '#f9f9f9',
  padding: '15px',
  borderRadius: '5px',
  marginTop: '10px',
  marginBottom: '10px',
  borderLeft: '4px solid #ddd',
}

const smallText = {
  color: '#999',
  fontSize: '12px',
  lineHeight: '18px',
  textAlign: 'left' as const,
}

export const previewProps: TemplateProps = {
  email: 'batman@example.com',
  name: 'Bruce Wayne',
  message: 'I would like to inquire about your services.',
}

export const templateName = 'contact'

export const Template = ({ email, name, message }: TemplateProps) => (
  <Html>
    <Head />
    <Preview>
      New contact form submission from {name} ({email})
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={paragraph}>
            <strong>New Contact Form Submission</strong>
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>From:</strong> {name}
          </Text>
          <Text style={paragraph}>
            <strong>Email:</strong>{' '}
            <Link style={anchor} href={`mailto:${email}`}>
              {email}
            </Link>
          </Text>
          <Text style={paragraph}>
            <strong>Message:</strong>
          </Text>
          <Text style={{ ...paragraph, ...messageBox }}>{message}</Text>
          <Hr style={hr} />
          <Text style={smallText}>This is an automated notification. Please do not reply directly to this email.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
