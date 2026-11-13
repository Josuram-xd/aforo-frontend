import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errors'
import {
  createCamera,
  renameCamera,
  saveCameraConnection,
  saveClassroom,
  saveCourse,
} from '../../api/facilities'
import { queryKeys } from '../../api/queryKeys'
import type { Camera, CameraConnection, Classroom, Course } from '../../api/types'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Field, PasswordInput, SelectInput, TextInput } from '../../components/ui/Field'
import { CameraConnectGuide } from './CameraConnectGuide'

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

/**
 * Add or edit a camera and its Tapo connection. The IP and the "camera account" (created in the Tapo app)
 * are stored by aforo-db; the vision node picks them up on its own, so no file or command is needed.
 */
/** A new camera whose connection save failed: its classroom and position can no longer change. */
interface CreatedCamera {
  id: string
  name: string
  classroomId: string
  position: 'outside' | 'inside'
}

export function CameraDialog({
  camera,
  classrooms,
  connection,
  onClose,
  onSaved,
}: {
  camera: Camera | null
  classrooms: Classroom[]
  connection: CameraConnection | undefined
  onClose: () => void
  onSaved: (name: string) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Camera created by a previous attempt whose connection save failed.
  const created = useRef<CreatedCamera | null>(null)
  const save = useMutation({
    mutationFn: async (v: {
      name: string
      classroomId: string
      position: 'outside' | 'inside'
      host: string
      username: string
      password: string
    }) => {
      let id = camera?.id
      if (camera) {
        if (v.name !== camera.name) await renameCamera(camera.id, v.name)
      } else {
        // If saving the connection fails, a retry reuses the camera already created:
        // createCamera again would collide with unique(classroom_id, position).
        created.current ??= {
          id: (
            await createCamera({ classroom_id: v.classroomId, position: v.position, name: v.name })
          ).id,
          name: v.name,
          classroomId: v.classroomId,
          position: v.position,
        }
        id = created.current.id
        if (v.name !== created.current.name) {
          await renameCamera(id, v.name)
          created.current.name = v.name
        }
      }
      await saveCameraConnection(id!, v)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.cameras }),
        queryClient.invalidateQueries({ queryKey: queryKeys.cameraConnections }),
      ]),
    onSuccess: (_, v) => {
      onSaved(v.name)
      onClose()
    },
  })

  const fieldError = (key: string) => errors[key] ?? null
  const input = (key: string) => ({ name: key, 'aria-invalid': errors[key] ? true : undefined })

  return (
    <FormDialog
      formId="camera-form"
      title={camera ? t('settings.cameras.editTitle') : t('settings.cameras.addTitle')}
      description={t('settings.cameras.connectHint')}
      submitLabel={t('common.save')}
      pending={save.isPending}
      error={save.error}
      onClose={onClose}
      onSubmit={(data) => {
        const v = {
          name: text(data, 'name'),
          classroomId:
            camera?.classroom_id ?? created.current?.classroomId ?? text(data, 'classroom'),
          position: (camera?.position ?? created.current?.position ?? text(data, 'position')) as
            'outside' | 'inside',
          host: text(data, 'host'),
          username: text(data, 'username'),
          password: String(data.get('password') ?? ''),
        }
        const next: Record<string, string> = {}
        if (!v.name) next.name = t('settings.validation.name')
        if (!v.classroomId) next.classroom = t('settings.cameras.validation.classroom')
        if (!/^[A-Za-z0-9.-]{1,253}$/.test(v.host))
          next.host = t('settings.cameras.validation.host')
        if (!v.username) next.username = t('settings.cameras.validation.username')
        if (!v.password && !connection) next.password = t('settings.cameras.validation.password')
        setErrors(next)
        if (Object.keys(next).length === 0) save.mutate(v)
      }}
    >
      <Field
        label={t('settings.cameras.name')}
        error={fieldError('name')}
        className="form-grid__full"
      >
        {({ id, describedBy }) => (
          <TextInput
            id={id}
            autoFocus
            maxLength={80}
            defaultValue={camera?.name ?? ''}
            aria-describedby={describedBy}
            {...input('name')}
          />
        )}
      </Field>
      {!camera && (
        <>
          <Field label={t('settings.cameras.classroom')} error={fieldError('classroom')}>
            {({ id, describedBy }) => (
              <SelectInput
                id={id}
                defaultValue=""
                disabled={created.current !== null}
                aria-describedby={describedBy}
                {...input('classroom')}
              >
                <option value="" disabled>
                  {t('settings.cameras.choose')}
                </option>
                {classrooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          <Field label={t('cameras.fields.position')}>
            {({ id }) => (
              <SelectInput
                id={id}
                defaultValue="outside"
                name="position"
                disabled={created.current !== null}
              >
                <option value="outside">{t('cameras.position.outside')}</option>
                <option value="inside">{t('cameras.position.inside')}</option>
              </SelectInput>
            )}
          </Field>
        </>
      )}
      <CameraConnectGuide>
        <Field
          label={t('settings.cameras.host')}
          hint={t('settings.cameras.hostHint')}
          error={fieldError('host')}
          className="form-grid__full"
        >
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              inputMode="decimal"
              placeholder="192.168.1.50"
              maxLength={253}
              defaultValue={connection?.host ?? ''}
              aria-describedby={describedBy}
              {...input('host')}
            />
          )}
        </Field>
        <Field
          label={t('settings.cameras.username')}
          hint={t('settings.cameras.usernameHint')}
          error={fieldError('username')}
        >
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              autoComplete="off"
              maxLength={64}
              defaultValue={connection?.username ?? ''}
              aria-describedby={describedBy}
              {...input('username')}
            />
          )}
        </Field>
        <Field
          label={t('settings.cameras.password')}
          hint={
            connection ? t('settings.cameras.passwordKeep') : t('settings.cameras.passwordHint')
          }
          error={fieldError('password')}
        >
          {({ id, describedBy }) => (
            <PasswordInput
              id={id}
              autoComplete="new-password"
              maxLength={128}
              aria-describedby={describedBy}
              {...input('password')}
            />
          )}
        </Field>
      </CameraConnectGuide>
    </FormDialog>
  )
}
