import { RotateCcw, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import './EmptyState.css'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  retrying?: boolean
  compact?: boolean
}

/** Inline error with a retry button (ARCHITECTURE.md §8.4). Never shows raw server errors. */
export function ErrorState({ message, onRetry, retrying, compact }: ErrorStateProps) {
  const { t } = useTranslation()
  return (
    <div
      className={`empty-state empty-state--error${compact ? ' empty-state--compact' : ''}`}
      role="alert"
    >
      <span className="empty-state__icon" aria-hidden="true">
        <TriangleAlert size={compact ? 20 : 24} />
      </span>
      <p className="empty-state__title">{message ?? t('common.error')}</p>
      <p className="empty-state__description">{t('common.errorHint')}</p>
      {onRetry && (
        <div className="empty-state__action">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            loading={retrying}
            icon={<RotateCcw size={14} aria-hidden="true" />}
          >
            {t('common.retry')}
          </Button>
        </div>
      )}
    </div>
  )
}
