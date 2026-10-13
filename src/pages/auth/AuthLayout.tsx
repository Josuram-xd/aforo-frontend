import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { BrandMark } from '../../components/BrandMark'
import { ThemeToggle } from '../../layouts/ThemeToggle'
import './AuthLayout.css'

interface AuthLayoutProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/** Frame shared by the sign-in, sign-up and password pages. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = `${title} · ${t('app.name')}`
  }, [title, t])

  return (
    <div className="auth">
      <main className="auth__main">
        <div className="auth__topbar">
          <Link to="/login" className="auth__brand">
            <BrandMark size={30} />
            <span>{t('app.name')}</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="auth__panel">
          <header className="auth__header">
            <h1 className="auth__title">{title}</h1>
            {subtitle && <p className="auth__subtitle">{subtitle}</p>}
          </header>
          {children}
          {footer && <div className="auth__footer">{footer}</div>}
        </div>
        <p className="auth__legal">{t('auth.legal')}</p>
      </main>
    </div>
  )
}
