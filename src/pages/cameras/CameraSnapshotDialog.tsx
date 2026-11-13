import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchCameraSnapshot, requestCameraSnapshot } from '../../api/facilities'
import type { Camera } from '../../api/types'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { formatTimeWithSeconds } from '../../lib/format'

const POLL_MS = 2_000
/** The first answer (t = 0 s) plus one poll every 2 s up to 20 s. */
const MAX_POLLS = 11

/** Admin only. Asks the camera for a still image and polls until it arrives or times out. */
export function CameraSnapshotDialog({ camera, onClose }: { camera: Camera; onClose: () => void }) {
  const { t } = useTranslation()
  // Each retry asks the camera again, which starts a new request and a new polling cycle.
  const [attempt, setAttempt] = useState(0)
  // Polls made for the current request; the query fails once it reaches MAX_POLLS while pending.
  const polls = useRef(0)

  const request = useQuery({
    queryKey: ['camera-snapshot-request', camera.id, attempt],
    queryFn: () => {
      polls.current = 0
      return requestCameraSnapshot(camera.id)
    },
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const snapshot = useQuery({
    queryKey: ['camera-snapshot', request.data],
    queryFn: async () => {
      const result = await fetchCameraSnapshot(request.data!)
      polls.current += 1
      if (result.status === 'pending' && polls.current >= MAX_POLLS) {
        throw new Error('camera did not answer in time')
      }
      return result
    },
    enabled: request.data !== undefined,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      query.state.status === 'success' && query.state.data?.status === 'pending' ? POLL_MS : false,
  })

  const data = snapshot.data
  const failed =
    request.isError || snapshot.isError || data?.status === 'failed' || data?.status === 'expired'
  const image = data?.status === 'done' && data.image ? data : null
  const retry = () => setAttempt((a) => a + 1)

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={t('cameras.snapshot.title', { name: camera.name })}
      footer={
        failed ? (
          <Button variant="secondary" onClick={retry}>
            {t('cameras.snapshot.retry')}
          </Button>
        ) : undefined
      }
    >
      <div className="camera-snapshot">
        {failed ? (
          <Alert tone="danger">{t('cameras.snapshot.failed')}</Alert>
        ) : image ? (
          <figure className="camera-snapshot__figure">
            <img
              className="camera-snapshot__image"
              src={`data:image/jpeg;base64,${image.image}`}
              alt={t('cameras.snapshot.alt', { name: camera.name })}
            />
            {image.takenAt && (
              <figcaption>
                {t('cameras.snapshot.takenAt', { time: formatTimeWithSeconds(image.takenAt) })}
              </figcaption>
            )}
          </figure>
        ) : (
          <p className="camera-snapshot__waiting" role="status">
            {t('cameras.snapshot.requesting')}
          </p>
        )}
        <p className="camera-snapshot__note">{t('cameras.snapshot.note')}</p>
      </div>
    </Dialog>
  )
}
