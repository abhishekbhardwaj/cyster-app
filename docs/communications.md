# Communications Package Documentation

This document provides guidance on using and extending the shared communications package. Read `packages/communications/src/email/` for the actual implementation. It is the source of truth.

## Overview

The email service uses [jsx-email](https://jsx.email/) to build email templates with JSX components and sends them using [Nodemailer](https://nodemailer.com/) via SMTP.

The core email code lives in `packages/communications/src/email/`:

- `client.ts` - Configures Nodemailer transport and exports `send` and `template`
- `templates.ts` - Defines functions for each email type
- `index.ts` - Re-exports the client and templates under a default `email` object
- `templates/` - JSX components defining email structure and content

## Project Scripts

Run these from `packages/communications/`:

```bash
bun email:create YourNewEmailName
bun email:preview
bun email:check
```

## Creating New Email Templates

1. Create the template file: `bun email:create WelcomeEmail`
2. Build the template component by following the structure of the existing files in `packages/communications/src/email/templates/`

Use React and `jsx-email` components. Define props for dynamic content instead of hardcoding environment-specific values inside the template.

## Adding New Email Types

1. Add the template prop shape to `EmailTemplates` and create the sending function in `packages/communications/src/email/templates.ts`
2. Re-export template prop types from `packages/communications/src/email/index.ts` if consumers need them

Read the existing templates and `packages/communications/src/email/templates.ts` for the exact pattern.

## Sending Emails in Route Handlers

Import `email` from `@repo/communications/email` and call the appropriate template function.

Read these files for real examples:

- `apps/backend/src/services/auth.ts`
- `apps/backend/src/routers/app-service/static/contact.ts`

## Configuration

Read `packages/env/src/backend.ts` for the complete env schema. Email-specific variables:

- `SMTP_SERVER`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM`

Values such as `APP_NAME` and `BASE_APP_URL` are also commonly passed by callers into template functions.

## Best Practices

- Keep layouts simple because email client support varies
- Prefer `jsx-email` built-in components where possible
- Prefer component props over CSS-heavy styling for buttons
- Use `bun email:preview` during development
- Run `bun email:check` before shipping new templates
- Consider plain text fallbacks with `render(..., { plainText: true })`
- Use semantic elements, `alt` text, and accessible color contrast

## Related Documentation

- [Backend API Development Guide](./backend/api-development.md) - Integrating email sending into API routes
- [Backend Testing Guide](./backend/testing.md) - Email testing and mocking strategies
- [Backend Deployment Guide](./backend/deployment.md) - SMTP configuration and deployment considerations
