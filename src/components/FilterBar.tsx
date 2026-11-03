import { FilterX } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import './FilterBar.css'

interface FilterBarProps {
  children: ReactNode
  onClear?: () => void
  canClear?: boolean
  label: string
}

/** One row of filter controls above a table (wraps on small screens). */
export function FilterBar({ children, onClear, canClear, label }: FilterBarProps) {
  const { t } = useTranslation()
  return (
    <div className="filter-bar" role="search" aria-label={label}>
      <div className="filter-bar__fields">{children}</div>
      {onClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!canClear}
          icon={<FilterX size={15} aria-hidden="true" />}
        >
          {t('filters.clear')}
        </Button>
      )}
    </div>
  )
}
