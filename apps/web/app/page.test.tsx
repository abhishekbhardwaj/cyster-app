import { type ImgHTMLAttributes } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Page from './page'

vi.mock('next/image', () => ({
  default: ({ priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} {...(priority !== undefined ? { fetchPriority: 'high' } : {})} />
  ),
}))

describe('Home Page', () => {
  it('renders the get started instruction', () => {
    render(<Page />)
    expect(screen.getByText(/Get started by editing/)).toBeDefined()
  })

  it('renders the deploy link', () => {
    render(<Page />)
    const link = screen.getByRole('link', { name: /deploy now/i })
    expect(link).toBeDefined()
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('renders the open alert button', () => {
    render(<Page />)
    expect(screen.getByRole('button', { name: /open alert/i })).toBeDefined()
  })
})
