import { Body, Button, Container, Head, Hr, Html, Link, Preview, Section, Text } from 'jsx-email'

export interface TemplateProps {
  appName: string
  name?: string
  organizationName: string // Optional for organization invitation emails
  url: string
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

const button = {
  fontWeight: 'bold',
  padding: '10px',
  textDecoration: 'none',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}

export const previewProps: TemplateProps = {
  appName: 'App',
  organizationName: 'Example Organization',
  name: 'Bruce Wayne',
  url: 'https://example.com',
}

export const templateName = 'OrganizationInvitationEmail'

export const Template = ({ name, organizationName, url, appName }: TemplateProps) => (
  <Html>
    <Head />
    <Preview>
      Invitation to join {organizationName} on {appName}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Text style={paragraph}>Hi {name?.length ? name : 'there'},</Text>
          <Text style={paragraph}>
            You have been invited to join <b>{organizationName}</b> on {appName}. Click the button below to accept your
            invitation and get started:
          </Text>
          <Button
            align="center"
            backgroundColor="#4f46e5"
            borderRadius={5}
            fontSize={16}
            height={40}
            href={url}
            style={button}
            textColor="#fff"
            width={260}
          >
            Accept Invitation
          </Button>
          <Hr style={hr} />
          <Text style={{ ...paragraph, ...footer }}>
            If you do not wish to join {organizationName}, you can safely ignore this email.
          </Text>
          <Text style={{ ...paragraph, ...footer }}>
            Or copy and paste this URL into your browser:{' '}
            <Link style={anchor} href={url}>
              {url}
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
