import { useTranslation } from 'react-i18next'
import './Header.css'

export function Header() {
  const { t } = useTranslation()

  return (
    <header className="header">
      <h1 className="header__title">{t('app.title')}</h1>
    </header>
  )
}
