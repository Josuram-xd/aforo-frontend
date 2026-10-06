import { useTranslation } from 'react-i18next'
import { useAforo } from '../hooks/useAforo'
import './OccupancyCard.css'

export function OccupancyCard() {
  const { t } = useTranslation()
  const { data } = useAforo()

  return (
    <div className="occupancy-card">
      <h2 className="occupancy-card__title">{t('occupancy.title')}</h2>
      <p className="occupancy-card__value">{data?.currentOccupancy ?? '—'}</p>
    </div>
  )
}
