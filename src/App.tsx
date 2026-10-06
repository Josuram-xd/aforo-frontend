import { useTranslation } from 'react-i18next'
import { DashboardLayout } from './components/DashboardLayout'
import { OccupancyCard } from './components/OccupancyCard'
import { PeopleList } from './components/PeopleList'

function App() {
  const { t } = useTranslation()

  return (
    <DashboardLayout
      occupancy={<OccupancyCard />}
      people={<PeopleList />}
      events={<h2>{t('events.title')}</h2>}
    />
  )
}

export default App
