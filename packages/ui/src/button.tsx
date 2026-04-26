'use client'

import { type ReactNode } from 'react'

interface ButtonProps {
  readonly children: ReactNode
  readonly className?: string
  readonly appName: string
}

export const Button = ({ children, className, appName }: ButtonProps) => {
  return (
    <button className={className} onClick={() => alert(`Hello from your ${appName} app!`)}>
      {children}
    </button>
  )
}
