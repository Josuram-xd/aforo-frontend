import { ArrowLeft, Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '../components/ui/Button'
import './StatusPage.css'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <section className="status-page">
      <span className="status-page__icon" aria-hidden="true">
        <Compass size={28} />
      </span>
      <p className="status-page__code">404</p>
      <h2 className="status-page__title">{t('notFound.title')}</h2>
      <p className="status-page__text">{t('notFound.description')}</p>
      <ButtonLink to="/" variant="primary" icon={<ArrowLeft size={16} aria-hidden="true" />}>
        {t('notFound.back')}
      </ButtonLink>
    </section>
  )
}
