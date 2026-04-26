import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Code } from './code'

describe('Code', () => {
  it('renders children in a code element', () => {
    render(<Code>const x = 1</Code>)
    const el = screen.getByText('const x = 1')
    expect(el.tagName).toBe('CODE')
  })

  it('applies custom className', () => {
    render(<Code className="highlight">snippet</Code>)
    expect(screen.getByText('snippet').className).toBe('highlight')
  })
})
