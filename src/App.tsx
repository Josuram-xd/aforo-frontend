import { DashboardLayout } from './components/DashboardLayout'
import { EventTimeline } from './components/EventTimeline'
import { OccupancyCard } from './components/OccupancyCard'
import { PeopleList } from './components/PeopleList'

function App() {
  return (
    <DashboardLayout
      occupancy={<OccupancyCard />}
      people={<PeopleList />}
      events={<EventTimeline />}
    />
  )
}

export default App
