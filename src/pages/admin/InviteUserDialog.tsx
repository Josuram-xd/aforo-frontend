import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { inviteUser } from '../../api/admin'
import { AppError, errorMessageKey } from '../../api/errors'
import { queryKeys } from '../../api/queryKeys'
import { ROLE_CODES, type RoleCode } from '../../auth/roles'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Dialog } from '../../components/ui/Dialog'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface InviteUserDialogProps {
  open: boolean
  onClose: () => void
  onInvited?: (email: string) => void
}

/** Sends an invitation email through the invite-user Edge Function (admin only). */
export function InviteUserDialog({ open, onClose, onInvited }: InviteUserDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [emailError, setEmailError] = useState<string | null>(null)

  const invite = useMutation({
    mutationFn: ({ email, role }: { email: string; role: RoleCode }) => inviteUser(email, role),
    onSuccess: async (_, { email }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users })
      onInvited?.(email)
      onClose()
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '')
      .trim()
      .toLowerCase()
    const role = String(data.get('role') ?? 'viewer') as RoleCode
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      setEmailError(t('auth.validation.email'))
      return
    }
    setEmailError(null)
    invite.mutate({ email, role })
  }

  const errorKey =
    invite.error instanceof AppError && invite.error.status === 409
      ? 'admin.users.inviteExists'
      : errorMessageKey(invite.error)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Mail size={18} />}
      title={t('admin.users.inviteTitle')}
      description={t('admin.users.inviteHint')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="invite-form"
            loading={invite.isPending}
            icon={<Send size={15} aria-hidden="true" />}
          >
            {t('admin.users.sendInvite')}
          </Button>
        </>
      }
    >
      <form id="invite-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        {invite.isError && (
          <div className="form-grid__full">
            <Alert tone="danger" live="assertive">
              {t(errorKey)}
            </Alert>
          </div>
        )}
        <Field label={t('auth.email')} error={emailError} className="form-grid__full">
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="email"
              type="email"
              autoComplete="off"
              inputMode="email"
              placeholder={t('auth.emailPlaceholder')}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <Field label={t('admin.users.role')} className="form-grid__full">
          {({ id }) => (
            <SelectInput id={id} name="role" defaultValue="viewer">
              {ROLE_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(`roles.${code}`)}
                </option>
              ))}
            </SelectInput>
          )}
        </Field>
      </form>
    </Dialog>
  )
}
