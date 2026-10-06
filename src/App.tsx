import { useTranslation } from 'react-i18next'
import { DashboardLayout } from './components/DashboardLayout'

function App() {
  const { t } = useTranslation()

  return (
    <DashboardLayout
      occupancy={<h2>{t('occupancy.title')}</h2>}
      people={<h2>{t('people.title')}</h2>}
      events={<h2>{t('events.title')}</h2>}
    />
  )
}

export default App
