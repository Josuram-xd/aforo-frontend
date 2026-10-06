import { useTranslation } from 'react-i18next'
import { useAforo } from '../hooks/useAforo'
import { QueryStatus } from './QueryStatus'
import './OccupancyCard.css'

export function OccupancyCard() {
  const { t } = useTranslation()
  const { data, isPending, isError } = useAforo()

  return (
    <div className="occupancy-card">
      <h2 className="occupancy-card__title">{t('occupancy.title')}</h2>
      <QueryStatus isPending={isPending} isError={isError} />
      <p className="occupancy-card__value">{data?.currentOccupancy ?? '—'}</p>
    </div>
  )
}
