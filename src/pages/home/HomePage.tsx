import { DashboardLayout } from '../../components/DashboardLayout'
import { EventTimeline } from '../../components/EventTimeline'
import { OccupancyCard } from '../../components/OccupancyCard'
import { PeopleList } from '../../components/PeopleList'

/** Temporary v1 dashboard inside the new shell; replaced by the v2 home in task 14. */
export function HomePage() {
  return (
    <DashboardLayout
      occupancy={<OccupancyCard />}
      people={<PeopleList />}
      events={<EventTimeline />}
    />
  )
}
