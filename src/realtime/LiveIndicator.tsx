import { useTranslation } from 'react-i18next'
import { useLiveStatus } from './realtimeContext'
import './LiveIndicator.css'

/** "En vivo" / "Reconectando…" pill for the topbar (DESIGN_SYSTEM.md §8.3). */
export function LiveIndicator() {
  const { t } = useTranslation()
  const status = useLiveStatus()
  const connected = status === 'connected'
  const label = connected
    ? t('live.connected')
    : status === 'connecting'
      ? t('live.connecting')
      : t('live.reconnecting')

  return (
    <span
      className={`live-indicator${connected ? ' live-indicator--on' : ''}`}
      role="status"
      title={connected ? t('live.connectedHint') : t('live.fallbackHint')}
    >
      <span className="live-indicator__dot" aria-hidden="true" />
      <span className="live-indicator__label">{label}</span>
    </span>
  )
}
