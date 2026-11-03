import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import './Alert.css'

type AlertTone = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps {
  tone?: AlertTone
  title?: ReactNode
  children?: ReactNode
  /** Announce immediately (errors) or politely (confirmations). */
  live?: 'assertive' | 'polite'
}

const ICONS = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert }

/** Inline message box used in forms and pages. */
export function Alert({ tone = 'info', title, children, live }: AlertProps) {
  const Icon = ICONS[tone]
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined
  return (
    <div className={`alert alert--${tone}`} role={role}>
      <Icon size={18} aria-hidden="true" className="alert__icon" />
      <div className="alert__body">
        {title && <p className="alert__title">{title}</p>}
        {children && <div className="alert__text">{children}</div>}
      </div>
    </div>
  )
}
