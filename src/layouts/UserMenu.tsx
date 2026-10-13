import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Avatar } from '../components/ui/Avatar'
import type { ShellUser } from './AppShell'

interface UserMenuProps {
  user: ShellUser
  onSignOut: () => void
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const firstItem = rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')
    firstItem?.focus()

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
        return
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      const items = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
      )
      const index = items.indexOf(document.activeElement as HTMLElement)
      const delta = event.key === 'ArrowDown' ? 1 : -1
      items[(index + delta + items.length) % items.length]?.focus()
      event.preventDefault()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="user-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar name={user.name} imageUrl={user.avatarUrl} size="sm" />
        <span className="user-menu__name">{user.name}</span>
        <span className="visually-hidden">{t('shell.userMenu')}</span>
        <ChevronDown size={16} aria-hidden="true" className="user-menu__chevron" />
      </button>
      {open && (
        <div className="user-menu__panel" role="menu" id={menuId} aria-label={t('shell.userMenu')}>
          <div className="user-menu__header">
            <Avatar name={user.name} imageUrl={user.avatarUrl} size="md" />
            <div className="user-menu__identity">
              <span className="user-menu__header-name">{user.name}</span>
              {user.email && <span className="user-menu__email">{user.email}</span>}
              <span className="user-menu__role">{t(`roles.${user.role}`)}</span>
            </div>
          </div>
          <Link
            to="/perfil"
            role="menuitem"
            className="user-menu__item"
            onClick={() => setOpen(false)}
          >
            <UserRound size={16} aria-hidden="true" />
            {t('nav.profile')}
          </Link>
          <button
            type="button"
            role="menuitem"
            className="user-menu__item user-menu__item--danger"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
