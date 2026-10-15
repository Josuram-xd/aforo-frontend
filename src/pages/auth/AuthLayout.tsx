import { Activity, ShieldCheck, ScanFace } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { BrandMark } from '../../components/BrandMark'
import { AuthEmblem } from './AuthEmblem'
import { AuthIllustration } from './AuthIllustration'
import './AuthLayout.css'

interface AuthLayoutProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
}

/**
 * Split layout for sign-in, sign-up and password pages (DESIGN_SYSTEM.md §8.7): product panel
 * with an SVG illustration on the left, the form on the right with an emblem above it. The panel
 * and the emblem hide on small screens, where the compact brand takes their place.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = `${title} · ${t('app.name')}`
  }, [title, t])

  const features = [
    { icon: Activity, text: t('authPanel.featureLive') },
    { icon: ScanFace, text: t('authPanel.featureFace') },
    { icon: ShieldCheck, text: t('authPanel.featureRoles') },
  ]

  return (
    <div className="auth">
      <aside className="auth__showcase" aria-label={t('authPanel.label')}>
        <div className="auth__showcase-inner">
          <Link to="/login" className="auth__brand auth__brand--light">
            <BrandMark size={34} />
            <span>{t('app.name')}</span>
          </Link>
          <div className="auth__pitch">
            <p className="auth__eyebrow">{t('authPanel.eyebrow')}</p>
            <h2 className="auth__headline">{t('authPanel.headline')}</h2>
            <p className="auth__lead">{t('authPanel.lead')}</p>
          </div>
          <AuthIllustration />
          <ul className="auth__features">
            {features.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className="auth__feature-icon" aria-hidden="true">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth__main">
        <div className="auth__topbar">
          <Link to="/login" className="auth__brand auth__brand--compact">
            <BrandMark size={30} />
            <span>{t('app.name')}</span>
          </Link>
        </div>
        <AuthEmblem />
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
