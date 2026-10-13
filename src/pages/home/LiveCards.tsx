import { Activity, ArrowRight, BellRing, Cctv } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { SeverityBadge } from '../../components/AlertBadges'
import { EventList } from '../../components/EventList'
import { Badge } from '../../components/ui/Badge'
import { Card, CardHeader } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { SkeletonList } from '../../components/ui/Skeleton'
import { useAlerts, useCameras, useLatestEvents } from '../../hooks/queries'
import { formatRelative } from '../../lib/format'
import './LiveCards.css'

function SeeAll({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="see-all">
      {label}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  )
}

export function LatestEventsCard({ classroomId }: { classroomId: string | undefined }) {
  const { t } = useTranslation()
  const events = useLatestEvents(classroomId, 10)

  return (
    <Card aria-labelledby="latest-events-title">
      <CardHeader
        titleId="latest-events-title"
        icon={<Activity size={18} />}
        title={t('dashboard.latestEvents')}
        description={t('dashboard.latestEventsHint')}
        actions={<SeeAll to="/eventos" label={t('dashboard.seeHistory')} />}
      />
      {events.isPending ? (
        <SkeletonList rows={6} />
      ) : events.isError ? (
        <ErrorState compact onRetry={() => void events.refetch()} retrying={events.isFetching} />
      ) : events.data.length === 0 ? (
        <EmptyState
          compact
          icon={Activity}
          title={t('dashboard.noEvents')}
          description={t('chart.emptyHint')}
        />
      ) : (
        <EventList events={events.data} />
      )}
    </Card>
  )
}

export function OpenAlertsCard() {
  const { t } = useTranslation()
  const alerts = useAlerts('open')

  return (
    <Card aria-labelledby="open-alerts-title">
      <CardHeader
        titleId="open-alerts-title"
        icon={<BellRing size={18} />}
        title={t('dashboard.openAlerts')}
        actions={<SeeAll to="/alertas" label={t('dashboard.seeAll')} />}
      />
      {alerts.isPending ? (
        <SkeletonList rows={3} />
      ) : alerts.isError ? (
        <ErrorState compact onRetry={() => void alerts.refetch()} retrying={alerts.isFetching} />
      ) : alerts.data.length === 0 ? (
        <EmptyState
          compact
          icon={BellRing}
          title={t('dashboard.noOpenAlerts')}
          description={t('alerts.allClear')}
        />
      ) : (
        <ul className="mini-list">
          {alerts.data.slice(0, 5).map((alert) => (
            <li key={alert.id} className={`mini-list__item mini-list__item--${alert.severity}`}>
              <div className="mini-list__top">
                <span className="mini-list__title">{t(`alerts.type.${alert.type}`)}</span>
                <SeverityBadge severity={alert.severity} />
              </div>
              <p className="mini-list__text">{alert.message}</p>
              <time className="mini-list__meta" dateTime={alert.createdAt}>
                {formatRelative(alert.createdAt)}
                {alert.cameraName ? ` · ${alert.cameraName}` : ''}
              </time>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function CamerasCard({ classroomId }: { classroomId: string | undefined }) {
  const { t } = useTranslation()
  const cameras = useCameras()
  const list = (cameras.data ?? []).filter((c) => !classroomId || c.classroom_id === classroomId)

  return (
    <Card aria-labelledby="cameras-card-title">
      <CardHeader
        titleId="cameras-card-title"
        icon={<Cctv size={18} />}
        title={t('nav.cameras')}
        description={t('cameras.cardHint')}
        actions={<SeeAll to="/camaras" label={t('dashboard.seeAll')} />}
      />
      {cameras.isPending ? (
        <SkeletonList rows={2} />
      ) : cameras.isError ? (
        <ErrorState compact onRetry={() => void cameras.refetch()} retrying={cameras.isFetching} />
      ) : list.length === 0 ? (
        <EmptyState compact icon={Cctv} title={t('cameras.empty')} />
      ) : (
        <ul className="mini-list">
          {list.map((camera) => (
            <li key={camera.id} className="mini-list__item">
              <div className="mini-list__top">
                <span className="mini-list__title">{camera.name}</span>
                <Badge tone={camera.status === 'online' ? 'success' : 'danger'} dot>
                  {t(`cameras.status.${camera.status}`)}
                </Badge>
              </div>
              <p className="mini-list__meta">
                {t(`cameras.position.${camera.position}`)} ·{' '}
                {camera.last_seen_at
                  ? t('cameras.lastSeen', { when: formatRelative(camera.last_seen_at) })
                  : t('cameras.neverSeen')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
