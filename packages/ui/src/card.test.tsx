import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Card } from './card'

describe('Card', () => {
  it('renders title and children', () => {
    render(
      <Card title="Test Card" href="https://example.com">
        Card content
      </Card>,
    )
    expect(screen.getByText('Test Card')).toBeDefined()
    expect(screen.getByText('Card content')).toBeDefined()
  })

  it('renders as a link with utm params', () => {
    render(
      <Card title="Docs" href="https://example.com/docs">
        Read the docs
      </Card>,
    )
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toContain('https://example.com/docs')
    expect(link.getAttribute('href')).toContain('utm_source=create-turbo')
  })

  it('opens in a new tab', () => {
    render(
      <Card title="Docs" href="https://example.com">
        Content
      </Card>,
    )
    const link = screen.getByRole('link')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('applies custom className', () => {
    render(
      <Card title="Test" href="https://example.com" className="my-card">
        Content
      </Card>,
    )
    expect(screen.getByRole('link').className).toBe('my-card')
  })
})
