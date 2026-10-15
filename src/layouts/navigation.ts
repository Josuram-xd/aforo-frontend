import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  CalendarClock,
  Cctv,
  GraduationCap,
  History,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
} from 'lucide-react'
import { ADMIN_ROLES, STAFF_ROLES, type RoleCode } from '../auth/roles'

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  /** Roles that see the item; empty = every role. Mirrors ARCHITECTURE.md §8.3. */
  roles: readonly RoleCode[]
}

export interface NavSection {
  titleKey: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: 'nav.sections.main',
    items: [
      { to: '/', labelKey: 'nav.home', icon: LayoutDashboard, roles: [] },
      { to: '/eventos', labelKey: 'nav.events', icon: History, roles: STAFF_ROLES },
      { to: '/estudiantes', labelKey: 'nav.students', icon: GraduationCap, roles: STAFF_ROLES },
      { to: '/sesiones', labelKey: 'nav.sessions', icon: CalendarClock, roles: STAFF_ROLES },
      { to: '/camaras', labelKey: 'nav.cameras', icon: Cctv, roles: [] },
      { to: '/alertas', labelKey: 'nav.alerts', icon: Bell, roles: [] },
    ],
  },
  {
    titleKey: 'nav.sections.admin',
    items: [
      { to: '/admin/usuarios', labelKey: 'nav.admin.users', icon: Users, roles: ADMIN_ROLES },
      { to: '/admin/auditoria', labelKey: 'nav.admin.audit', icon: ScrollText, roles: ADMIN_ROLES },
      {
        to: '/admin/configuracion',
        labelKey: 'nav.admin.settings',
        icon: Settings,
        roles: ADMIN_ROLES,
      },
    ],
  },
]
