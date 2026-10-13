import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import './TopProgressBar.css'

/**
 * Thin bar under the topbar for background work: refetches of queries that already have
 * data (first loads show skeletons instead, §8.5) and running mutations.
 */
export function TopProgressBar() {
  const { t } = useTranslation()
  const refetching = useIsFetching({ predicate: (query) => query.state.data !== undefined })
  const mutating = useIsMutating()
  const active = refetching + mutating > 0

  return (
    <div className={`top-progress${active ? ' top-progress--active' : ''}`} aria-hidden={!active}>
      {active && <span className="visually-hidden">{t('common.updating')}</span>}
      <span className="top-progress__bar" />
    </div>
  )
}
