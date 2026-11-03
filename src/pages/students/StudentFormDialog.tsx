import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import { removeStudentPhoto, saveStudent, uploadStudentPhoto } from '../../api/students'
import type { Student } from '../../api/types'
import { Alert } from '../../components/ui/Alert'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Field, TextInput } from '../../components/ui/Field'
import './StudentPhoto.css'
import { fileToJpeg } from '../../lib/image'
import {
  PERSON_NAME_MAX,
  normalizePersonName,
  validateEmail,
  validatePersonName,
} from '../../lib/validation'

interface StudentFormDialogProps {
  open: boolean
  student: Student | null
  onClose: () => void
  /** `created` is true for a new student, so the page can offer the biometric enrollment next. */
  onSaved?: (name: string, id: string, created: boolean) => void
  /** Current photo URL (signed) when editing. */
  photoUrl?: string | null
}

export function StudentFormDialog({
  open,
  student,
  onClose,
  onSaved,
  photoUrl,
}: StudentFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const [photo, setPhoto] = useState<{ blob: Blob; url: string } | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  useEffect(() => {
    const url = photo?.url
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [photo])

  const save = useMutation({
    mutationFn: async (input: {
      full_name: string
      email: string | null
      student_code: string | null
    }) => {
      const id = await saveStudent(input, student?.id)
      const oldPath = student?.photo_path ?? null
      if (photo) {
        const path = await uploadStudentPhoto(id, photo.blob)
        await saveStudent({ ...input, photo_path: path }, id)
        if (oldPath) await removeStudentPhoto(oldPath)
      } else if (removePhoto && oldPath) {
        await saveStudent({ ...input, photo_path: null }, id)
        await removeStudentPhoto(oldPath)
      }
      return id
    },
    onSuccess: async (id, input) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.students })
      await queryClient.invalidateQueries({ queryKey: queryKeys.studentPhotos })
      onSaved?.(input.full_name, id, !student)
      onClose()
    },
  })

  async function handlePhoto(file: File | undefined) {
    setPhotoError(null)
    if (!file) return
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setPhotoError(t('students.photo.type'))
    try {
      const blob = await fileToJpeg(file)
      setPhoto({ blob, url: URL.createObjectURL(blob) })
      setRemovePhoto(false)
    } catch {
      setPhotoError(t('students.photo.unreadable'))
    }
  }

  const shownPhoto = removePhoto ? null : (photo?.url ?? photoUrl ?? null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const fullName = normalizePersonName(String(data.get('fullName') ?? ''))
    const email = String(data.get('email') ?? '').trim()
    const code = String(data.get('code') ?? '').trim()

    const next: typeof errors = {}
    const nameCheck = validatePersonName(fullName)
    if (nameCheck) next.name = t(nameCheck.key, nameCheck.values)
    const emailCheck = email === '' ? null : validateEmail(email)
    if (emailCheck) next.email = t(emailCheck.key, emailCheck.values)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    save.mutate({ full_name: fullName, email: email || null, student_code: code || null })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={student ? t('students.editTitle') : t('students.createTitle')}
      description={t('students.formHint')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="student-form" loading={save.isPending}>
            {student ? t('common.save') : t('students.submitCreate')}
          </Button>
        </>
      }
    >
      <form id="student-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        {save.isError && (
          <div className="form-grid__full">
            <Alert tone="danger" live="assertive">
              {t(errorMessageKey(save.error))}
            </Alert>
          </div>
        )}
        <Field label={t('students.fields.name')} error={errors.name} className="form-grid__full">
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="fullName"
              autoFocus
              defaultValue={student?.full_name ?? ''}
              maxLength={PERSON_NAME_MAX}
              autoComplete="off"
              required
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <div className="form-grid__full student-photo">
          <Avatar name={student?.full_name || '?'} imageUrl={shownPhoto} size="lg" />
          <div className="student-photo__body">
            <span className="student-photo__label">
              {t('students.photo.label')} · {t('common.optional')}
            </span>
            <span className="student-photo__hint">{t('students.photo.hint')}</span>
            <span className="student-photo__actions">
              <label className="btn btn--secondary btn--sm">
                <ImagePlus size={14} aria-hidden="true" />
                {shownPhoto ? t('students.photo.change') : t('students.photo.choose')}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="visually-hidden"
                  onChange={(event) => {
                    void handlePhoto(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />
              </label>
              {shownPhoto && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={14} aria-hidden="true" />}
                  onClick={() => {
                    setPhoto(null)
                    setRemovePhoto(true)
                  }}
                >
                  {t('students.photo.remove')}
                </Button>
              )}
            </span>
            {photoError && <span className="student-photo__error">{photoError}</span>}
          </div>
        </div>
        <Field label={t('students.fields.code')} hint={t('common.optional')}>
          {({ id, describedBy }) => (
            <TextInput
              id={id}
              name="code"
              defaultValue={student?.student_code ?? ''}
              maxLength={40}
              autoComplete="off"
              aria-describedby={describedBy}
            />
          )}
        </Field>
        <Field label={t('students.fields.email')} hint={t('common.optional')} error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="email"
              type="email"
              defaultValue={student?.email ?? ''}
              autoComplete="off"
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
      </form>
    </Dialog>
  )
}
