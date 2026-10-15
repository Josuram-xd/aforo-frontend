import { Info, OctagonAlert, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AlertSeverity } from '../api/types'
import { Badge, type BadgeTone } from './ui/Badge'

const SEVERITY: Record<AlertSeverity, { tone: BadgeTone; icon: typeof Info }> = {
  info: { tone: 'accent', icon: Info },
  warning: { tone: 'warning', icon: TriangleAlert },
  critical: { tone: 'danger', icon: OctagonAlert },
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const { t } = useTranslation()
  const { tone, icon: Icon } = SEVERITY[severity]
  return (
    <Badge tone={tone} icon={<Icon />}>
      {t(`alerts.severity.${severity}`)}
    </Badge>
  )
}
