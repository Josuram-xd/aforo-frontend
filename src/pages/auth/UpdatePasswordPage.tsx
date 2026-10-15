import { CircleCheck, ShieldCheck } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { useSession } from '../../auth/authContext'
import { clearMustSetPassword } from '../../auth/passwordSetup'
import { authErrorKey } from '../../auth/authErrors'
import { PASSWORD_MIN_LENGTH, passwordStrength } from '../../auth/passwordStrength'
import { FullPageLoader } from '../../components/FullPageLoader'
import { Alert } from '../../components/ui/Alert'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Field, PasswordInput } from '../../components/ui/Field'
import { supabase } from '../../lib/supabase'
import { AuthLayout } from './AuthLayout'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import './PasswordStrength.css'

const LINK_TIMEOUT_MS = 10_000

/**
 * Step 2 of the reset: the email link opens this page with a PKCE code; supabase-js turns it
 * into a temporary session, and the user picks a new password.
 */
export function UpdatePasswordPage() {
  const { t } = useTranslation()
  const { user, loading } = useSession()
  const [params] = useSearchParams()
  const isInvite = params.get('invitacion') === '1'
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({})
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (user) return
    const timer = setTimeout(() => setTimedOut(true), LINK_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const chosen = password
    const repeated = confirm
    setPassword('')
    setConfirm('')

    const next: typeof errors = {}
    if (chosen.length < PASSWORD_MIN_LENGTH) next.password = t('auth.validation.passwordMin')
    else if (passwordStrength(chosen) === 0) next.password = t('auth.errors.weakPassword')
    if (repeated !== chosen) next.confirm = t('auth.validation.passwordMismatch')
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setErrorKey(null)
    const { error } = await supabase.auth.updateUser({ password: chosen })
    setSubmitting(false)
    if (error) {
      setErrorKey(authErrorKey(error, 'update'))
      return
    }
    clearMustSetPassword()
    setDone(true)
  }

  if (done) {
    return (
      <AuthLayout title={t('auth.passwordUpdatedTitle')} subtitle={t('auth.passwordUpdatedText')}>
        <span className="auth__sent-icon" aria-hidden="true">
          <CircleCheck size={30} />
        </span>
        <ButtonLink to="/" variant="primary" block>
          {t('auth.goToDashboard')}
        </ButtonLink>
      </AuthLayout>
    )
  }

  if (!user) {
    if (loading || !timedOut) return <FullPageLoader />
    return (
      <AuthLayout title={t('auth.callbackFailedTitle')}>
        <Alert tone="danger" live="assertive">
          {t('auth.errors.linkExpired')}
        </Alert>
        <ButtonLink to="/recuperar" variant="primary" block>
          {t('auth.requestNewLink')}
        </ButtonLink>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={isInvite ? t('auth.inviteTitle') : t('auth.newPasswordTitle')}
      subtitle={isInvite ? t('auth.inviteSubtitle') : t('auth.newPasswordSubtitle')}
    >
      {errorKey && (
        <Alert tone="danger" live="assertive">
          {t(errorKey)}
        </Alert>
      )}
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {/* Lets password managers attach the new password to the right account. */}
        <input
          type="email"
          name="username"
          autoComplete="username"
          value={user.email ?? ''}
          readOnly
          hidden
        />
        <Field label={t('auth.newPassword')} error={errors.password}>
          {({ id, describedBy, invalid }) => (
            <>
              <PasswordInput
                id={id}
                name="new-password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={[describedBy, `${id}-strength`].filter(Boolean).join(' ')}
                aria-invalid={invalid || undefined}
              />
              <PasswordStrengthMeter password={password} id={`${id}-strength`} />
            </>
          )}
        </Field>
        <Field label={t('auth.confirmPassword')} error={errors.confirm}>
          {({ id, describedBy, invalid }) => (
            <PasswordInput
              id={id}
              name="confirm-password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <Button
          type="submit"
          size="lg"
          block
          loading={submitting}
          icon={<ShieldCheck size={18} aria-hidden="true" />}
        >
          {t('auth.saveNewPassword')}
        </Button>
      </form>
    </AuthLayout>
  )
}
