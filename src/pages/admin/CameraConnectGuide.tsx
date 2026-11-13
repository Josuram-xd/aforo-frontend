import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import './CameraConnectGuide.css'

/**
 * Three-step guide to connect a Tapo camera. Steps 1 and 2 are instructions; step 3 hosts the
 * connection fields (children). Keep it an ordered list so screen readers announce "step n of 3".
 */
// TODO: the Tapo menu names below are not verified against the app; keep them generic until checked.
export function CameraConnectGuide({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <ol className="connect-guide" aria-label={t('settings.cameras.guide.label')}>
      <li className="connect-guide__step">
        <h3 className="connect-guide__title">{t('settings.cameras.guide.step1Title')}</h3>
        <p className="connect-guide__text">{t('settings.cameras.guide.step1Text')}</p>
      </li>
      <li className="connect-guide__step">
        <h3 className="connect-guide__title">{t('settings.cameras.guide.step2Title')}</h3>
        <p className="connect-guide__text">{t('settings.cameras.guide.step2Text')}</p>
        <details className="connect-guide__help">
          <summary>{t('settings.cameras.guide.helpSummary')}</summary>
          <p>{t('settings.cameras.guide.helpText')}</p>
        </details>
      </li>
      <li className="connect-guide__step">
        <h3 className="connect-guide__title">{t('settings.cameras.guide.step3Title')}</h3>
        <p className="connect-guide__text">{t('settings.cameras.guide.step3Text')}</p>
        <div className="connect-guide__fields">{children}</div>
      </li>
    </ol>
  )
}
