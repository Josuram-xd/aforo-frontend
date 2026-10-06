import { useTranslation } from 'react-i18next'
import { DashboardLayout } from './components/DashboardLayout'
import { OccupancyCard } from './components/OccupancyCard'

function App() {
  const { t } = useTranslation()

  return (
    <DashboardLayout
      occupancy={<OccupancyCard />}
      people={<h2>{t('people.title')}</h2>}
      events={<h2>{t('events.title')}</h2>}
    />
  )
}

export default App
