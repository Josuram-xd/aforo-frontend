import { Bell, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation, useMatches } from 'react-router'
import { canAccess, type RoleCode } from '../auth/roles'
import { BrandMark } from '../components/BrandMark'
import { NAV_SECTIONS } from './navigation'
import { UserMenu } from './UserMenu'
import './AppShell.css'

export interface ShellUser {
  name: string
  email: string | null
  avatarUrl: string | null
  role: RoleCode
}

/** Route `handle` used to name each page in the topbar and the document title. */
export interface RouteHandle {
  titleKey: string
}

interface AppShellProps {
  user: ShellUser
  onSignOut: () => void
  openAlerts?: number
  liveIndicator?: ReactNode
  /** Rendered between the topbar and the page (e.g. the background refetch bar). */
  topSlot?: ReactNode
}

function usePageTitleKey(): string {
  const matches = useMatches()
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index]?.handle as RouteHandle | undefined
    if (handle?.titleKey) return handle.titleKey
  }
  return 'app.name'
}

export function AppShell({
  user,
  onSignOut,
  openAlerts = 0,
  liveIndicator,
  topSlot,
}: AppShellProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const titleKey = usePageTitleKey()
  const title = t(titleKey)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = `${title} · ${t('app.name')}`
  }, [title, t])

  // Close the mobile drawer whenever the route changes.
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setDrawerOpen(false)
  }

  useEffect(() => {
    if (!drawerOpen) return
    sidebarRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const button = menuButtonRef.current
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      button?.focus()
    }
  }, [drawerOpen])

  const alertsLabel =
    openAlerts > 0 ? t('shell.alertsWithCount', { count: openAlerts }) : t('shell.alertsNone')

  return (
    <div className={`shell${drawerOpen ? ' shell--drawer-open' : ''}`}>
      <a href="#main-content" className="skip-link">
        {t('shell.skipToContent')}
      </a>

      <aside
        ref={sidebarRef}
        className="sidebar"
        id="app-sidebar"
        aria-label={t('shell.navigation')}
      >
        <div className="sidebar__brand">
          <Link to="/" className="sidebar__brand-link">
            <BrandMark size={34} />
            <span className="sidebar__brand-text">
              <span className="sidebar__brand-name">{t('app.name')}</span>
              <span className="sidebar__brand-tagline">{t('app.tagline')}</span>
            </span>
          </Link>
          <button
            type="button"
            className="icon-button sidebar__close"
            onClick={() => setDrawerOpen(false)}
            aria-label={t('shell.closeMenu')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV_SECTIONS.map((section) => {
            const items = section.items.filter((item) => canAccess(user.role, item.roles))
            if (items.length === 0) return null
            return (
              <div className="sidebar__section" key={section.titleKey}>
                <p className="sidebar__section-title">{t(section.titleKey)}</p>
                <ul className="sidebar__list">
                  {items.map((item) => {
                    const Icon = item.icon
                    const label = t(item.labelKey)
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.to === '/'}
                          className="sidebar__link"
                          title={label}
                        >
                          <Icon size={19} aria-hidden="true" className="sidebar__icon" />
                          <span className="sidebar__label">{label}</span>
                          {item.to === '/alertas' && openAlerts > 0 && (
                            <span className="sidebar__count tabular" aria-hidden="true">
                              {openAlerts}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__role-dot" aria-hidden="true" />
          <span className="sidebar__footer-text">
            {t('shell.signedInAs', { role: t(`roles.${user.role}`) })}
          </span>
        </div>
      </aside>

      <div className="shell__scrim" aria-hidden="true" onClick={() => setDrawerOpen(false)} />

      <div className="shell__main" inert={drawerOpen}>
        <header className="topbar">
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button topbar__menu"
            aria-label={t('shell.openMenu')}
            aria-expanded={drawerOpen}
            aria-controls="app-sidebar"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <h1 className="topbar__title">{title}</h1>
          <div className="topbar__actions">
            {liveIndicator}
            <Link
              to="/alertas"
              className="icon-button topbar__bell"
              aria-label={alertsLabel}
              title={alertsLabel}
            >
              <Bell size={18} aria-hidden="true" />
              {openAlerts > 0 && (
                <span className="topbar__badge tabular" aria-hidden="true">
                  {openAlerts > 99 ? '99+' : openAlerts}
                </span>
              )}
            </Link>
            <span className="topbar__divider" aria-hidden="true" />
            <UserMenu user={user} onSignOut={onSignOut} />
          </div>
        </header>
        {topSlot}
        <main id="main-content" className="shell__content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
