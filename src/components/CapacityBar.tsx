import { useTranslation } from 'react-i18next'
import { capacityLevel } from '../lib/capacity'
import './CapacityBar.css'

interface CapacityBarProps {
  current: number
  max: number
}

/** Capacity bar with a text label — the level is never conveyed by color alone. */
export function CapacityBar({ current, max }: CapacityBarProps) {
  const { t } = useTranslation()
  const percent = max > 0 ? Math.round((current / max) * 100) : 0
  const level = capacityLevel(current, max)

  return (
    <div className={`capacity capacity--${level}`}>
      <div
        className="capacity__track"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={t('occupancy.meterText', { current, max, percent })}
        aria-label={t('occupancy.capacity')}
      >
        <span className="capacity__fill" style={{ width: `${Math.min(percent, 100)}%` }} />
        <span className="capacity__tick" style={{ left: '80%' }} aria-hidden="true" />
      </div>
      <div className="capacity__labels">
        <span className="capacity__level">{t(`occupancy.level.${level}`)}</span>
        <span className="capacity__percent tabular">
          {t('occupancy.percentOfCapacity', { percent })}
        </span>
      </div>
    </div>
  )
}
