import { useTranslation } from 'react-i18next'
import type { AlertSeverity } from '../api/types'
import { Badge, type BadgeTone } from './ui/Badge'

const SEVERITY_TONE: Record<AlertSeverity, BadgeTone> = {
  info: 'accent',
  warning: 'warning',
  critical: 'danger',
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const { t } = useTranslation()
  return <Badge tone={SEVERITY_TONE[severity]}>{t(`alerts.severity.${severity}`)}</Badge>
}
