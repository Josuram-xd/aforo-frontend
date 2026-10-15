import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import './EmptyState.css'

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: ReactNode
  compact?: boolean
}

/** Icon + one sentence + optional action (DESIGN_SYSTEM.md §8.6). */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact,
}: EmptyStateProps) {
  const { t } = useTranslation()
  return (
    <div className={`empty-state${compact ? ' empty-state--compact' : ''}`}>
      <span className="empty-state__icon" aria-hidden="true">
        <Icon size={compact ? 20 : 24} />
      </span>
      <p className="empty-state__title">{title ?? t('common.empty')}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
