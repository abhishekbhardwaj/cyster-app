import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button appName="test">Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined()
  })

  it('applies custom className', () => {
    render(
      <Button appName="test" className="custom-class">
        Click
      </Button>,
    )
    expect(screen.getByRole('button').className).toBe('custom-class')
  })

  it('alerts with app name on click', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(vi.fn())
    const user = userEvent.setup()

    render(<Button appName="web">Click</Button>)
    await user.click(screen.getByRole('button'))

    expect(alertSpy).toHaveBeenCalledWith('Hello from your web app!')
    alertSpy.mockRestore()
  })
})
