import { LogIn, LogOut, PersonStanding, ScanFace } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Direction, EventMethod } from '../api/types'
import { Badge } from './ui/Badge'

/** "Entrada" (success) / "Salida" (danger) — a paired color, not good/bad (§5.3). */
export function DirectionBadge({ direction }: { direction: Direction }) {
  const { t } = useTranslation()
  return direction === 'ENTRY' ? (
    <Badge tone="success" icon={<LogIn />}>
      {t('events.direction.entry')}
    </Badge>
  ) : (
    <Badge tone="danger" icon={<LogOut />}>
      {t('events.direction.exit')}
    </Badge>
  )
}

/** FACE vs BODY_ONLY must stay distinct everywhere (AGENTS rule 3). */
export function MethodBadge({ method }: { method: EventMethod }) {
  const { t } = useTranslation()
  return method === 'FACE' ? (
    <Badge tone="accent" icon={<ScanFace />} title={t('events.method.faceHint')}>
      {t('events.method.face')}
    </Badge>
  ) : (
    <Badge tone="warning" icon={<PersonStanding />} title={t('events.method.bodyHint')}>
      {t('events.method.body')}
    </Badge>
  )
}
