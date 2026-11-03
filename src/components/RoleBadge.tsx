import { Eye, GraduationCap, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { RoleCode } from '../auth/roles'
import { Badge, type BadgeTone } from './ui/Badge'

const ROLE: Record<RoleCode, { tone: BadgeTone; icon: typeof Eye }> = {
  admin: { tone: 'violet', icon: ShieldCheck },
  teacher: { tone: 'accent', icon: GraduationCap },
  viewer: { tone: 'neutral', icon: Eye },
}

export function RoleBadge({ role }: { role: RoleCode }) {
  const { t } = useTranslation()
  const { tone, icon: Icon } = ROLE[role]
  return (
    <Badge tone={tone} icon={<Icon />}>
      {t(`roles.${role}`)}
    </Badge>
  )
}
