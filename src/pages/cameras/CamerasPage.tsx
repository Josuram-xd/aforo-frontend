import { Cctv, VideoOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Camera, Classroom } from '../../api/types'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageIntro } from '../../components/ui/PageIntro'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { useCameras, useClassrooms } from '../../hooks/queries'
import { useNow } from '../../hooks/useNow'
import { formatDateTime, formatRelative } from '../../lib/format'
import './CamerasPage.css'

/** A heartbeat older than this is shown as "late" even if the row still says online. */
const STALE_AFTER_MS = 2 * 60_000

function CameraCard({ camera, now }: { camera: Camera; now: number }) {
  const { t } = useTranslation()
  const online = camera.status === 'online'
  const lastSeen = camera.last_seen_at ? Date.parse(camera.last_seen_at) : null
  const stale = online && lastSeen !== null && now - lastSeen > STALE_AFTER_MS

  return (
    <Card as="article" className={`camera-card${online ? ' is-online' : ' is-offline'}`}>
      <div className="camera-card__preview" aria-hidden="true">
        <div className="camera-card__scanlines" />
        {online ? <Cctv size={34} /> : <VideoOff size={34} />}
        <span className="camera-card__rec">
          <span className="camera-card__rec-dot" />
          {camera.code}
        </span>
      </div>
      <div className="camera-card__body">
        <div className="camera-card__top">
          <h2 className="camera-card__name">{camera.name}</h2>
          <Badge tone={online ? (stale ? 'warning' : 'success') : 'danger'} dot>
            {online
              ? stale
                ? t('cameras.status.late')
                : t('cameras.status.online')
              : t('cameras.status.offline')}
          </Badge>
        </div>
        <dl className="camera-card__facts">
          <div>
            <dt>{t('cameras.fields.position')}</dt>
            <dd>{t(`cameras.position.${camera.position}`)}</dd>
          </div>
          <div>
            <dt>{t('cameras.fields.heartbeat')}</dt>
            <dd title={camera.last_seen_at ? formatDateTime(camera.last_seen_at) : undefined}>
              {camera.last_seen_at
                ? formatRelative(camera.last_seen_at, now)
                : t('cameras.neverSeen')}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}

/** Cámaras: online/offline and last heartbeat of each camera, live (Realtime on `cameras`). */
export function CamerasPage() {
  const { t } = useTranslation()
  const cameras = useCameras()
  const classrooms = useClassrooms()
  const now = useNow(10_000)

  if (cameras.isPending) {
    return (
      <>
        <PageIntro description={t('cameras.description')} />
        <div className="camera-grid">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={5} />
        </div>
      </>
    )
  }
  if (cameras.isError) {
    return <ErrorState onRetry={() => void cameras.refetch()} retrying={cameras.isFetching} />
  }

  const online = cameras.data.filter((c) => c.status === 'online').length
  const groups = (classrooms.data ?? []).map((room: Classroom) => ({
    room,
    cameras: cameras.data.filter((camera) => camera.classroom_id === room.id),
  }))

  return (
    <>
      <PageIntro
        description={t('cameras.description')}
        actions={
          <Badge tone={online === cameras.data.length ? 'success' : 'warning'}>
            {t('cameras.summary', { online, total: cameras.data.length })}
          </Badge>
        }
      />
      {cameras.data.length === 0 ? (
        <EmptyState icon={Cctv} title={t('cameras.empty')} description={t('cameras.emptyHint')} />
      ) : (
        groups
          .filter((group) => group.cameras.length > 0)
          .map((group) => (
            <section key={group.room.id} className="camera-group" aria-label={group.room.name}>
              {groups.length > 1 && <h2 className="camera-group__title">{group.room.name}</h2>}
              <div className="camera-grid">
                {group.cameras.map((camera) => (
                  <CameraCard key={camera.id} camera={camera} now={now} />
                ))}
              </div>
            </section>
          ))
      )}
      <p className="camera-note">{t('cameras.lanOnly')}</p>
    </>
  )
}
