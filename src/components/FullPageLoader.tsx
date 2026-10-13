import { useTranslation } from 'react-i18next'
import { BrandMark } from './BrandMark'
import './FullPageLoader.css'

/** Splash shown while the session and role are restored. */
export function FullPageLoader() {
  const { t } = useTranslation()
  return (
    <div className="full-loader" role="status" aria-busy="true">
      <span className="full-loader__mark">
        <BrandMark size={44} />
      </span>
      <span className="full-loader__bar" aria-hidden="true" />
      <span className="visually-hidden">{t('common.loading')}</span>
    </div>
  )
}
