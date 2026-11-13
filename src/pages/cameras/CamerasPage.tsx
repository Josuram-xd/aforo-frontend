import { Cctv, Clock, Eye, Pencil, Plus, VideoOff, Wifi, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Camera, Classroom } from '../../api/types'
import { useRole } from '../../auth/useRole'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { PageIntro } from '../../components/ui/PageIntro'
import { TOURS } from '../../components/tutorial/tours'
import { SkeletonCard } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/toastContext'
import { useCameraConnections, useCameras, useClassrooms } from '../../hooks/queries'
import { useNow } from '../../hooks/useNow'
import { formatDateTime, formatRelative } from '../../lib/format'
import { CameraDialog } from '../admin/SettingsDialogs'
import { CameraSnapshotDialog } from './CameraSnapshotDialog'
import './CamerasPage.css'

/** A heartbeat older than this is shown as "late" even if the row still says online. */
const STALE_AFTER_MS = 2 * 60_000

/** `onConnect` and `onSnapshot` are only passed to admins; `host` is the stored IP, if connected. */
function CameraCard({
  camera,
  now,
  host,
  onConnect,
  onSnapshot,
}: {
  camera: Camera
  now: number
  host?: string
  onConnect?: () => void
  onSnapshot?: () => void
}) {
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
          <Badge
            tone={online ? (stale ? 'warning' : 'success') : 'danger'}
            icon={online ? stale ? <Clock /> : <Wifi /> : <WifiOff />}
          >
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
          {onConnect && (
            <div>
              <dt>{t('settings.cameras.connection')}</dt>
              <dd>{host ?? t('settings.cameras.notConnected')}</dd>
            </div>
          )}
        </dl>
        {(onConnect || onSnapshot) && (
          <div className="camera-card__actions">
            {onConnect && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pencil size={14} aria-hidden="true" />}
                onClick={onConnect}
                aria-label={t('settings.cameras.connectNamed', { name: camera.name })}
              >
                {host ? t('cameras.editConnection') : t('settings.cameras.connect')}
              </Button>
            )}
            {onSnapshot && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Eye size={14} aria-hidden="true" />}
                onClick={onSnapshot}
                aria-label={t('cameras.snapshot.buttonNamed', { name: camera.name })}
              >
                {t('cameras.snapshot.button')}
              </Button>
            )}
          </div>
        )}
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
  const isAdmin = useRole().role === 'admin'
  // The RPC only answers to admins, so other roles never call it.
  const connections = useCameraConnections(isAdmin)
  const toast = useToast()
  // `null` = adding a new camera; `undefined` = dialog closed.
  const [editing, setEditing] = useState<Camera | null | undefined>(undefined)
  // Camera whose still image is being requested (admin only); unmounting the dialog stops polling.
  const [snapshotOf, setSnapshotOf] = useState<Camera | null>(null)

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

  const addButton = isAdmin && (
    <Button
      size="sm"
      variant="secondary"
      data-tour="cameras-add"
      icon={<Plus size={14} aria-hidden="true" />}
      onClick={() => setEditing(null)}
    >
      {t('settings.cameras.add')}
    </Button>
  )

  return (
    <>
      <PageIntro
        tour={TOURS.cameras}
        description={t('cameras.description')}
        actions={
          <>
            <span data-tour="cameras-summary">
              <Badge tone={online === cameras.data.length ? 'success' : 'warning'}>
                {t('cameras.summary', { online, total: cameras.data.length })}
              </Badge>
            </span>
            {cameras.data.length > 0 && addButton}
          </>
        }
      />
      {cameras.data.length === 0 ? (
        <EmptyState
          icon={Cctv}
          title={t('cameras.empty')}
          description={t('cameras.emptyHint')}
          action={addButton || undefined}
        />
      ) : (
        groups
          .filter((group) => group.cameras.length > 0)
          .map((group, index) => (
            <section
              key={group.room.id}
              className="camera-group"
              aria-label={group.room.name}
              data-tour={index === 0 ? 'cameras-grid' : undefined}
            >
              {groups.length > 1 && <h2 className="camera-group__title">{group.room.name}</h2>}
              <div className="camera-grid">
                {group.cameras.map((camera) => (
                  <CameraCard
                    key={camera.id}
                    camera={camera}
                    now={now}
                    host={connections.data?.find((c) => c.camera_id === camera.id)?.host}
                    onConnect={isAdmin ? () => setEditing(camera) : undefined}
                    onSnapshot={isAdmin ? () => setSnapshotOf(camera) : undefined}
                  />
                ))}
              </div>
            </section>
          ))
      )}
      <div className="camera-note" data-tour="cameras-note">
        <Alert tone="info" title={t('cameras.localNode.title')}>
          {t('cameras.localNode.body')}
        </Alert>
      </div>
      {isAdmin && snapshotOf && (
        <CameraSnapshotDialog camera={snapshotOf} onClose={() => setSnapshotOf(null)} />
      )}
      {isAdmin && editing !== undefined && (
        <CameraDialog
          camera={editing}
          classrooms={classrooms.data ?? []}
          connection={connections.data?.find((c) => c.camera_id === editing?.id)}
          onClose={() => setEditing(undefined)}
          onSaved={(name) => toast.success(t('settings.toast.saved', { name }))}
        />
      )}
    </>
  )
}
