import type { ReactNode } from 'react'
import './Badge.css'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'violet'

interface BadgeProps {
  tone?: BadgeTone
  icon?: ReactNode
  /** Small leading dot (status). The text always carries the meaning too. */
  dot?: boolean
  children: ReactNode
  title?: string
}

export function Badge({ tone = 'neutral', icon, dot, children, title }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`} title={title}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {icon && (
        <span className="badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}
