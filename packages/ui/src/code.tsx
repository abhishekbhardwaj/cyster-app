import { type JSX } from 'react'

export function Code({
  children,
  className,
}: {
  readonly children: React.ReactNode
  readonly className?: string
}): JSX.Element {
  return <code className={className}>{children}</code>
}
