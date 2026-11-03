import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import { saveStudent } from '../../api/students'
import type { Student } from '../../api/types'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Field, TextInput } from '../../components/ui/Field'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MAX = 120

interface StudentFormDialogProps {
  open: boolean
  student: Student | null
  onClose: () => void
  onSaved?: (name: string) => void
}

export function StudentFormDialog({ open, student, onClose, onSaved }: StudentFormDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})

  const save = useMutation({
    mutationFn: (input: { full_name: string; email: string | null; student_code: string | null }) =>
      saveStudent(input, student?.id),
    onSuccess: async (_, input) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.students })
      onSaved?.(input.full_name)
      onClose()
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const fullName = String(data.get('fullName') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const code = String(data.get('code') ?? '').trim()

    const next: typeof errors = {}
    if (fullName === '') next.name = t('auth.validation.nameRequired')
    else if (fullName.length > NAME_MAX) next.name = t('auth.validation.nameTooLong')
    if (email !== '' && !EMAIL_PATTERN.test(email)) next.email = t('auth.validation.email')
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
              defaultValue={student?.full_name ?? ''}
              maxLength={NAME_MAX}
              autoComplete="off"
              required
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
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
