import { useTranslation } from 'react-i18next'
import type { Classroom } from '../../api/types'
import { CapacityBar } from '../../components/CapacityBar'
import { capacityLevel } from '../../lib/capacity'
import { StatCard } from '../../components/StatCard'
import { SkeletonStatCard } from '../../components/ui/Skeleton'
import { useAlerts, useCameras, useDailySummary, useSessions } from '../../hooks/queries'
import { formatDateTime, formatInteger, formatRelative, formatTime } from '../../lib/format'
import { OccupancyNumber } from './OccupancyNumber'

interface DashboardStatsProps {
  classroom: Classroom | undefined
  day: string
  isStaff: boolean
}

/** Top row of the home page: occupancy hero + three KPIs that depend on the role. */
export function DashboardStats({ classroom, day, isStaff }: DashboardStatsProps) {
  return (
    <div className="dashboard__stats">
      <OccupancyCard classroom={classroom} />
      {isStaff ? (
        <StaffStats classroomId={classroom?.id} day={day} />
      ) : (
        <ViewerStats classroomId={classroom?.id} />
      )}
    </div>
  )
}

function OccupancyCard({ classroom }: { classroom: Classroom | undefined }) {
  const { t } = useTranslation()
  if (!classroom) return <SkeletonStatCard />
  const level = capacityLevel(classroom.current_occupancy, classroom.max_capacity)

  return (
    <StatCard
      className="dashboard__occupancy"
      label={t('occupancy.title')}
      tone={level === 'over' ? 'danger' : level === 'high' ? 'warning' : 'accent'}
      value={<OccupancyNumber value={classroom.current_occupancy} />}
      suffix={t('occupancy.ofMax', { max: classroom.max_capacity })}
      footer={
        classroom.occupancy_updated_at
          ? t('occupancy.updated', { when: formatRelative(classroom.occupancy_updated_at) })
          : undefined
      }
    >
      <CapacityBar current={classroom.current_occupancy} max={classroom.max_capacity} />
    </StatCard>
  )
}

function StaffStats({ classroomId, day }: { classroomId: string | undefined; day: string }) {
  const { t } = useTranslation()
  const summary = useDailySummary(classroomId, day)

  if (summary.isPending) {
    return (
      <>
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </>
    )
  }

  const data = summary.data
  const entries = data?.entries ?? 0
  const exits = data?.exits ?? 0
  const total = entries + exits
  const facePct = data?.face_identified_pct ?? null
  const bodyCount = total - (data?.face_identified ?? 0)

  return (
    <>
      <StatCard
        label={t('dashboard.entriesToday')}
        tone="success"
        value={formatInteger(entries)}
        footer={
          data?.first_event_at
            ? t('dashboard.firstAt', { time: formatTime(data.first_event_at) })
            : t('dashboard.noEventsYet')
        }
      />
      <StatCard
        label={t('dashboard.exitsToday')}
        tone="danger"
        value={formatInteger(exits)}
        footer={
          data?.peak_occupancy != null
            ? t('dashboard.peak', { count: data.peak_occupancy })
            : t('dashboard.noEventsYet')
        }
      />
      <StatCard
        label={t('dashboard.identified')}
        tone="violet"
        value={facePct === null ? '—' : String(Math.round(facePct))}
        suffix={facePct === null ? undefined : t('dashboard.percentFace')}
        footer={
          total > 0
            ? t('dashboard.bodyOnlyCount', { count: bodyCount })
            : t('dashboard.noEventsYet')
        }
      />
    </>
  )
}

function ViewerStats({ classroomId }: { classroomId: string | undefined }) {
  const { t } = useTranslation()
  const cameras = useCameras()
  const alerts = useAlerts('open')
  const sessions = useSessions()

  if (cameras.isPending || alerts.isPending || sessions.isPending) {
    return (
      <>
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </>
    )
  }

  const roomCameras = (cameras.data ?? []).filter(
    (c) => !classroomId || c.classroom_id === classroomId,
  )
  const online = roomCameras.filter((c) => c.status === 'online').length
  const openAlerts = alerts.data?.length ?? 0
  const now = new Date().toISOString()
  const nextSession = (sessions.data ?? [])
    .filter((s) => s.status === 'scheduled' && s.ends_at > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0]

  return (
    <>
      <StatCard
        label={t('dashboard.camerasOnline')}
        tone={online === roomCameras.length && online > 0 ? 'success' : 'warning'}
        value={online}
        suffix={t('occupancy.ofMax', { max: roomCameras.length })}
        footer={t('dashboard.camerasHint')}
      />
      <StatCard
        label={t('dashboard.openAlerts')}
        tone={openAlerts > 0 ? 'danger' : 'success'}
        value={openAlerts}
        footer={openAlerts > 0 ? t('dashboard.openAlertsHint') : t('dashboard.noOpenAlerts')}
      />
      <StatCard
        label={
          nextSession && nextSession.starts_at <= now
            ? t('dashboard.currentSession')
            : t('dashboard.nextSession')
        }
        tone="violet"
        value={
          <span className="stat-card__text">{nextSession?.title ?? t('dashboard.noSession')}</span>
        }
        footer={nextSession ? formatDateTime(nextSession.starts_at) : undefined}
      />
    </>
  )
}
