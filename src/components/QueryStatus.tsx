import { useTranslation } from 'react-i18next'
import './QueryStatus.css'

interface QueryStatusProps {
  isPending: boolean
  isError: boolean
}

/** Loading / error message for a polled query. Renders nothing when all is well. */
export function QueryStatus({ isPending, isError }: QueryStatusProps) {
  const { t } = useTranslation()

  if (isError) {
    return (
      <p className="query-status query-status--error" role="alert">
        {t('status.error')}
      </p>
    )
  }
  if (isPending) {
    return (
      <p className="query-status" role="status">
        {t('status.loading')}
      </p>
    )
  }
  return null
}
