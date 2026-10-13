import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import { saveSession, type SessionInput } from '../../api/sessions'
import type { Classroom, Course, SessionItem } from '../../api/types'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'
import { bogotaDay, bogotaLocalToIso, isoToBogotaLocal } from '../../lib/format'

const TITLE_MAX = 160

interface SessionFormDialogProps {
  open: boolean
  session: SessionItem | null
  courses: Course[]
  classrooms: Classroom[]
  onClose: () => void
}

export function SessionFormDialog({
  open,
  session,
  courses,
  classrooms,
  onClose,
}: SessionFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<{ title?: string; course?: string; ends?: string }>({})

  const save = useMutation({
    mutationFn: (input: SessionInput) => saveSession(input, session?.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
      onClose()
    },
  })

  const today = bogotaDay()
  const defaultStart = session ? isoToBogotaLocal(session.starts_at) : `${today}T07:00`
  const defaultEnd = session ? isoToBogotaLocal(session.ends_at) : `${today}T09:00`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get('title') ?? '').trim()
    const courseId = String(data.get('course') ?? '')
    const classroomId = String(data.get('classroom') ?? '')
    const startsLocal = String(data.get('starts') ?? '')
    const endsLocal = String(data.get('ends') ?? '')
    const status = String(data.get('status') ?? 'scheduled')

    const next: typeof errors = {}
    if (title === '') next.title = t('sessions.validation.title')
    if (!courseId) next.course = t('sessions.validation.course')
    if (!startsLocal || !endsLocal || endsLocal <= startsLocal)
      next.ends = t('sessions.validation.range')
    setErrors(next)
    if (Object.keys(next).length > 0) return

    save.mutate({
      title: title.slice(0, TITLE_MAX),
      course_id: courseId,
      classroom_id: classroomId,
      starts_at: bogotaLocalToIso(startsLocal),
      ends_at: bogotaLocalToIso(endsLocal),
      status,
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={session ? t('sessions.editTitle') : t('sessions.createTitle')}
      description={t('sessions.formHint')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="session-form" loading={save.isPending}>
            {session ? t('common.save') : t('sessions.submitCreate')}
          </Button>
        </>
      }
    >
      <form id="session-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        {save.isError && (
          <div className="form-grid__full">
            <Alert tone="danger" live="assertive">
              {t(errorMessageKey(save.error))}
            </Alert>
          </div>
        )}
        <Field label={t('sessions.fields.title')} error={errors.title} className="form-grid__full">
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="title"
              defaultValue={session?.title ?? ''}
              maxLength={TITLE_MAX}
              placeholder={t('sessions.titlePlaceholder')}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <Field label={t('sessions.fields.course')} error={errors.course}>
          {({ id, describedBy, invalid }) => (
            <SelectInput
              id={id}
              name="course"
              defaultValue={session?.course_id ?? courses[0]?.id ?? ''}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.name}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>
        <Field label={t('sessions.fields.classroom')}>
          {({ id }) => (
            <SelectInput
              id={id}
              name="classroom"
              defaultValue={session?.classroom_id ?? classrooms[0]?.id ?? ''}
            >
              {classrooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>
        <Field label={t('sessions.fields.starts')} hint={t('sessions.bogotaTime')}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              name="starts"
              type="datetime-local"
              defaultValue={defaultStart}
              aria-describedby={describedBy}
            />
          )}
        </Field>
        <Field label={t('sessions.fields.ends')} error={errors.ends}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="ends"
              type="datetime-local"
              defaultValue={defaultEnd}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <Field label={t('sessions.fields.status')} className="form-grid__full">
          {({ id }) => (
            <SelectInput id={id} name="status" defaultValue={session?.status ?? 'scheduled'}>
              <option value="scheduled">{t('sessions.status.scheduled')}</option>
              <option value="cancelled">{t('sessions.status.cancelled')}</option>
            </SelectInput>
          )}
        </Field>
      </form>
    </Dialog>
  )
}
