import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errors'
import { renameCamera, saveClassroom, saveCourse } from '../../api/facilities'
import { queryKeys } from '../../api/queryKeys'
import type { Camera, Classroom, Course } from '../../api/types'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'

interface FormDialogProps {
  formId: string
  title: string
  description?: string
  submitLabel: string
  pending: boolean
  error: unknown
  onClose: () => void
  onSubmit: (data: FormData) => void
  children: ReactNode
}

function FormDialog({
  formId,
  title,
  description,
  submitLabel,
  pending,
  error,
  onClose,
  onSubmit,
  children,
}: FormDialogProps) {
  const { t } = useTranslation()
  return (
    <Dialog
      open
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="form-grid"
        noValidate
        onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          onSubmit(new FormData(event.currentTarget))
        }}
      >
        {Boolean(error) && (
          <div className="form-grid__full">
            <Alert tone="danger" live="assertive">
              {t(errorMessageKey(error))}
            </Alert>
          </div>
        )}
        {children}
      </form>
    </Dialog>
  )
}

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim()

export function ClassroomDialog({
  classroom,
  onClose,
  onSaved,
}: {
  classroom: Classroom | null
  onClose: () => void
  onSaved: (name: string) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<{ name?: string; capacity?: string }>({})
  const save = useMutation({
    mutationFn: (input: { name: string; location: string | null; max_capacity: number }) =>
      saveClassroom(input, classroom?.id),
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.classrooms })
      onSaved(input.name)
      onClose()
    },
  })

  return (
    <FormDialog
      formId="classroom-form"
      title={classroom ? t('settings.classrooms.editTitle') : t('settings.classrooms.createTitle')}
      description={t('settings.classrooms.formHint')}
      submitLabel={classroom ? t('common.save') : t('settings.classrooms.submitCreate')}
      pending={save.isPending}
      error={save.error}
      onClose={onClose}
      onSubmit={(data) => {
        const name = text(data, 'name')
        const capacity = Number(text(data, 'capacity'))
        const next: typeof errors = {}
        if (!name) next.name = t('settings.validation.name')
        if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)
          next.capacity = t('settings.validation.capacity')
        setErrors(next)
        if (Object.keys(next).length > 0) return
        save.mutate({ name, location: text(data, 'location') || null, max_capacity: capacity })
      }}
    >
      <Field label={t('settings.classrooms.name')} error={errors.name} className="form-grid__full">
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            name="name"
            autoFocus
            maxLength={120}
            defaultValue={classroom?.name ?? ''}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>
      <Field label={t('settings.classrooms.location')} hint={t('common.optional')}>
        {({ id, describedBy }) => (
          <TextInput
            id={id}
            name="location"
            maxLength={160}
            defaultValue={classroom?.location ?? ''}
            aria-describedby={describedBy}
          />
        )}
      </Field>
      <Field label={t('settings.classrooms.capacity')} error={errors.capacity}>
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            name="capacity"
            type="number"
            inputMode="numeric"
            min={1}
            max={10000}
            defaultValue={classroom?.max_capacity ?? 30}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>
    </FormDialog>
  )
}

export function CourseDialog({
  course,
  onClose,
  onSaved,
}: {
  course: Course | null
  onClose: () => void
  onSaved: (name: string) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<{ code?: string; name?: string }>({})
  const save = useMutation({
    mutationFn: (input: {
      code: string
      name: string
      academic_period: string | null
      is_active: boolean
    }) => saveCourse(input, course?.id),
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses })
      onSaved(input.name)
      onClose()
    },
  })

  return (
    <FormDialog
      formId="course-form"
      title={course ? t('settings.courses.editTitle') : t('settings.courses.createTitle')}
      submitLabel={course ? t('common.save') : t('settings.courses.submitCreate')}
      pending={save.isPending}
      error={save.error}
      onClose={onClose}
      onSubmit={(data) => {
        const code = text(data, 'code')
        const name = text(data, 'name')
        const next: typeof errors = {}
        if (!code) next.code = t('settings.validation.code')
        if (!name) next.name = t('settings.validation.name')
        setErrors(next)
        if (Object.keys(next).length > 0) return
        save.mutate({
          code,
          name,
          academic_period: text(data, 'period') || null,
          is_active: text(data, 'active') !== 'false',
        })
      }}
    >
      <Field label={t('settings.courses.code')} error={errors.code}>
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            name="code"
            autoFocus
            maxLength={30}
            defaultValue={course?.code ?? ''}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>
      <Field label={t('settings.courses.period')} hint={t('common.optional')}>
        {({ id, describedBy }) => (
          <TextInput
            id={id}
            name="period"
            maxLength={20}
            placeholder="2026-2"
            defaultValue={course?.academic_period ?? ''}
            aria-describedby={describedBy}
          />
        )}
      </Field>
      <Field label={t('settings.courses.name')} error={errors.name} className="form-grid__full">
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            name="name"
            maxLength={160}
            defaultValue={course?.name ?? ''}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>
      <Field label={t('settings.courses.status')} className="form-grid__full">
        {({ id }) => (
          <SelectInput
            id={id}
            name="active"
            defaultValue={course?.is_active === false ? 'false' : 'true'}
          >
            <option value="true">{t('settings.courses.active')}</option>
            <option value="false">{t('settings.courses.inactive')}</option>
          </SelectInput>
        )}
      </Field>
    </FormDialog>
  )
}

export function CameraDialog({
  camera,
  onClose,
  onSaved,
}: {
  camera: Camera
  onClose: () => void
  onSaved: (name: string) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: (name: string) => renameCamera(camera.id, name),
    onSuccess: async (_, name) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.cameras })
      onSaved(name)
      onClose()
    },
  })

  return (
    <FormDialog
      formId="camera-form"
      title={t('settings.cameras.renameTitle')}
      description={t('settings.cameras.renameHint', { code: camera.code })}
      submitLabel={t('common.save')}
      pending={save.isPending}
      error={save.error}
      onClose={onClose}
      onSubmit={(data) => {
        const name = text(data, 'name')
        if (!name) {
          setError(t('settings.validation.name'))
          return
        }
        setError(null)
        save.mutate(name)
      }}
    >
      <Field label={t('settings.cameras.name')} error={error} className="form-grid__full">
        {({ id, describedBy, invalid }) => (
          <TextInput
            id={id}
            name="name"
            autoFocus
            maxLength={80}
            defaultValue={camera.name}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
          />
        )}
      </Field>
    </FormDialog>
  )
}
