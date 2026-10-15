import type { ReactNode } from 'react'
import './StatCard.css'

export type StatTone = 'accent' | 'success' | 'danger' | 'warning' | 'violet' | 'neutral'

interface StatCardProps {
  label: string
  value: ReactNode
  /** Small text after the value ("/ 30", "%"). */
  suffix?: ReactNode
  icon?: ReactNode
  tone?: StatTone
  footer?: ReactNode
  children?: ReactNode
  className?: string
  /** Announce value changes to screen readers (live counters). */
  live?: boolean
}

export function StatCard({
  label,
  value,
  suffix,
  icon,
  tone = 'accent',
  footer,
  children,
  className,
  live,
}: StatCardProps) {
  return (
    <section className={`stat-card stat-card--${tone}${className ? ` ${className}` : ''}`}>
      <header className="stat-card__header">
        <h2 className="stat-card__label">{label}</h2>
        {icon && (
          <span className="stat-card__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </header>
      <p className="stat-card__value tabular" aria-live={live ? 'polite' : undefined}>
        {value}
        {suffix && <span className="stat-card__suffix">{suffix}</span>}
      </p>
      {children}
      {footer && <p className="stat-card__footer">{footer}</p>}
    </section>
  )
}
