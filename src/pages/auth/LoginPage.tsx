import { LogIn, Mail } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { logAccess } from '../../api/accessLog'
import { useSession } from '../../auth/authContext'
import { authErrorKey } from '../../auth/authErrors'
import { lockRemainingMs, registerFailure, resetFailures } from '../../auth/loginThrottle'
import { safeRedirectPath } from '../../auth/redirect'
import { Alert } from '../../components/ui/Alert'
import { Button } from '../../components/ui/Button'
import { Field, PasswordInput, TextInput } from '../../components/ui/Field'
import { supabase } from '../../lib/supabase'
import { AuthLayout } from './AuthLayout'
import { GoogleButton } from './GoogleButton'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function useLockCountdown(): [number, (ms: number) => void] {
  const [lockedUntil, setLockedUntil] = useState(() => Date.now() + lockRemainingMs())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (lockedUntil <= now) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [lockedUntil, now])

  const remainingSeconds = Math.max(0, Math.ceil((lockedUntil - now) / 1000))
  const lock = (ms: number) => {
    const current = Date.now()
    setNow(current)
    setLockedUntil(current + ms)
  }
  return [remainingSeconds, lock]
}

export function LoginPage() {
  const { t } = useTranslation()
  const { user } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const redirectTo = safeRedirectPath((location.state as { from?: unknown } | null)?.from)

  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [lockSeconds, lock] = useLockCountdown()

  if (user && !submitting) return <Navigate to={redirectTo} replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    // The password never stays in the DOM or in React state after submitting.
    const passwordInput = form.elements.namedItem('password')
    if (passwordInput instanceof HTMLInputElement) passwordInput.value = ''

    const errors: typeof fieldErrors = {}
    if (!EMAIL_PATTERN.test(email)) errors.email = t('auth.validation.email')
    if (password === '') errors.password = t('auth.validation.passwordRequired')
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const remaining = lockRemainingMs()
    if (remaining > 0) {
      lock(remaining)
      return
    }

    setSubmitting(true)
    setErrorKey(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setSubmitting(false)
      setErrorKey(authErrorKey(error, 'login'))
      const lockMs = registerFailure()
      if (lockMs > 0) lock(lockMs)
      return
    }

    resetFailures()
    void logAccess('LOGIN', 'password')
    navigate(redirectTo, { replace: true })
  }

  const locked = lockSeconds > 0

  return (
    <AuthLayout
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <>
          {t('auth.noAccount')} <Link to="/registro">{t('auth.signup')}</Link>
        </>
      }
    >
      {errorKey && !locked && (
        <Alert tone="danger" live="assertive">
          {t(errorKey)}
        </Alert>
      )}
      {locked && (
        <Alert tone="warning" live="polite" title={t('auth.lockedTitle')}>
          {t('auth.lockedText', { seconds: lockSeconds })}
        </Alert>
      )}

      <GoogleButton onError={setErrorKey} />
      <p className="auth__divider">{t('auth.orEmail')}</p>
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <Field label={t('auth.email')} error={fieldErrors.email}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              required
              placeholder={t('auth.emailPlaceholder')}
              icon={<Mail size={16} />}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <Field
          label={t('auth.password')}
          error={fieldErrors.password}
          labelAside={
            <Link to="/recuperar" className="auth__link-small">
              {t('auth.forgot')}
            </Link>
          }
        >
          {({ id, describedBy, invalid }) => (
            <PasswordInput
              id={id}
              name="password"
              autoComplete="current-password"
              required
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
          disabled={locked}
          icon={<LogIn size={18} aria-hidden="true" />}
        >
          {t('auth.login')}
        </Button>
      </form>
    </AuthLayout>
  )
}
