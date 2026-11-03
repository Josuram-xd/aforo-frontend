import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, ScanFace, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import { submitEnrollment } from '../../api/students'
import type { Student } from '../../api/types'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { blobToBase64, toJpeg } from '../../lib/image'
import './EnrollmentDialog.css'

const MIN_PHOTOS = 3
const MAX_PHOTOS = 5
const PHOTO_SIDE = 640

interface Shot {
  blob: Blob
  url: string
}

interface EnrollmentDialogProps {
  student: Student
  onClose: () => void
  onSent: (name: string) => void
}

/**
 * Biometric enrollment: takes a few face photos with the browser camera and sends them to the
 * vision node (aforo-db submit_enrollment). The node computes the embedding locally and erases
 * the photos; they are never kept.
 */
export function EnrollmentDialog({ student, onClose, onSent }: EnrollmentDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(() =>
    'getUserMedia' in (navigator.mediaDevices ?? {}) ? null : t('enrollment.noCamera'),
  )
  const [ready, setReady] = useState(false)
  const [consent, setConsent] = useState(false)
  const [shots, setShots] = useState<Shot[]>([])
  const shotsRef = useRef<Shot[]>([])

  useEffect(() => {
    shotsRef.current = shots
  })

  useEffect(() => () => shotsRef.current.forEach((shot) => URL.revokeObjectURL(shot.url)), [])

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    if (!('getUserMedia' in (navigator.mediaDevices ?? {}))) return
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((track) => track.stop())
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          void videoRef.current.play().then(() => setReady(true))
        }
      })
      .catch(() => setCameraError(t('enrollment.cameraDenied')))
    return () => {
      cancelled = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [t])

  async function takePhoto() {
    const video = videoRef.current
    if (!video || shots.length >= MAX_PHOTOS || video.videoWidth === 0) return
    const blob = await toJpeg(video, video.videoWidth, video.videoHeight, PHOTO_SIDE, 0.85)
    setShots((current) => [...current, { blob, url: URL.createObjectURL(blob) }])
  }

  function removeShot(index: number) {
    URL.revokeObjectURL(shots[index]!.url)
    setShots((current) => current.filter((_, i) => i !== index))
  }

  const send = useMutation({
    mutationFn: async () =>
      submitEnrollment(student.id, await Promise.all(shots.map((shot) => blobToBase64(shot.blob)))),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.students })
      onSent(student.full_name)
      onClose()
    },
  })

  const canSend = consent && shots.length >= MIN_PHOTOS

  return (
    <Dialog
      open
      size="lg"
      onClose={onClose}
      icon={<ScanFace size={20} />}
      title={t('enrollment.title', { name: student.full_name })}
      description={t('enrollment.description')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => send.mutate()} loading={send.isPending} disabled={!canSend}>
            {t('enrollment.send')}
          </Button>
        </>
      }
    >
      <div className="enroll">
        {send.isError && (
          <Alert tone="danger" live="assertive">
            {t(errorMessageKey(send.error))}
          </Alert>
        )}
        {cameraError ? (
          <Alert tone="warning">{cameraError}</Alert>
        ) : (
          <div className="enroll__stage">
            <video ref={videoRef} className="enroll__video" muted playsInline />
            <span className="enroll__guide" aria-hidden="true" />
            {!ready && <span className="enroll__wait">{t('enrollment.starting')}</span>}
          </div>
        )}

        <div className="enroll__bar">
          <Button
            icon={<Camera size={16} aria-hidden="true" />}
            onClick={() => void takePhoto()}
            disabled={!ready || shots.length >= MAX_PHOTOS}
          >
            {t('enrollment.take')}
          </Button>
          <span className="enroll__count tabular" aria-live="polite">
            {t('enrollment.count', { count: shots.length, min: MIN_PHOTOS, max: MAX_PHOTOS })}
          </span>
        </div>

        {shots.length > 0 && (
          <ul className="enroll__shots">
            {shots.map((shot, index) => (
              <li key={shot.url}>
                <img src={shot.url} alt={t('enrollment.shotAlt', { n: index + 1 })} />
                <button
                  type="button"
                  className="enroll__remove"
                  onClick={() => removeShot(index)}
                  aria-label={t('enrollment.removeShot', { n: index + 1 })}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="enroll__tips">{t('enrollment.tips')}</p>
        <label className="enroll__consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>{t('enrollment.consent')}</span>
        </label>
      </div>
    </Dialog>
  )
}
