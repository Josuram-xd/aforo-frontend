import { DoorOpen } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { STAFF_ROLES, canAccess } from '../../auth/roles'
import { useRole } from '../../auth/useRole'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { SelectInput } from '../../components/ui/Field'
import { PageIntro } from '../../components/ui/PageIntro'
import { useClassrooms } from '../../hooks/queries'
import { bogotaDay, formatLongDate } from '../../lib/format'
import { DashboardStats } from './DashboardStats'
import { HourlyChartCard } from './HourlyChartCard'
import './HomePage.css'

/** Inicio: live occupancy, today's KPIs, chart, latest events and open alerts (§8.4). */
export function HomePage() {
  const { t } = useTranslation()
  const { role } = useRole()
  const isStaff = canAccess(role, STAFF_ROLES)
  const classrooms = useClassrooms()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const day = bogotaDay()

  if (classrooms.isError) {
    return <ErrorState onRetry={() => void classrooms.refetch()} retrying={classrooms.isFetching} />
  }
  if (classrooms.data && classrooms.data.length === 0) {
    return (
      <EmptyState
        icon={DoorOpen}
        title={t('dashboard.noClassrooms')}
        description={t('dashboard.noClassroomsHint')}
      />
    )
  }

  const classroom = classrooms.data?.find((c) => c.id === selectedId) ?? classrooms.data?.[0]

  return (
    <div className="dashboard">
      <PageIntro
        eyebrow={formatLongDate(new Date())}
        description={
          classroom
            ? t('dashboard.intro', {
                name: classroom.name,
                location: classroom.location ?? t('dashboard.noLocation'),
              })
            : t('common.loading')
        }
        actions={
          classrooms.data && classrooms.data.length > 1 ? (
            <label className="dashboard__room-picker">
              <span className="visually-hidden">{t('dashboard.pickClassroom')}</span>
              <SelectInput
                value={classroom?.id ?? ''}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {classrooms.data.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : undefined
        }
      />
      <DashboardStats classroom={classroom} day={day} isStaff={isStaff} />
      {isStaff && <HourlyChartCard classroomId={classroom?.id} day={day} />}
    </div>
  )
}
