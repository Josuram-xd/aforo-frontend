import { ArrowLeft, ShieldX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '../components/ui/Button'
import './StatusPage.css'

export function ForbiddenPage() {
  const { t } = useTranslation()
  return (
    <section className="status-page">
      <span className="status-page__icon status-page__icon--danger" aria-hidden="true">
        <ShieldX size={28} />
      </span>
      <p className="status-page__code">403</p>
      <h2 className="status-page__title">{t('auth.forbidden')}</h2>
      <p className="status-page__text">{t('auth.forbiddenHint')}</p>
      <ButtonLink to="/" variant="primary" icon={<ArrowLeft size={16} aria-hidden="true" />}>
        {t('notFound.back')}
      </ButtonLink>
    </section>
  )
}
