import { MailCheck, Mail, UserRound, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import { useSession } from '../../auth/authContext'
import { authErrorKey } from '../../auth/authErrors'
import { PASSWORD_MIN_LENGTH, passwordStrength } from '../../auth/passwordStrength'
import { appUrl } from '../../auth/redirect'
import { Alert } from '../../components/ui/Alert'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Field, PasswordInput, TextInput } from '../../components/ui/Field'
import { supabase } from '../../lib/supabase'
import {
  EMAIL_MAX,
  PERSON_NAME_MAX,
  normalizePersonName,
  validateEmail,
  validatePersonName,
} from '../../lib/validation'
import { AuthLayout } from './AuthLayout'
import { GoogleButton } from './GoogleButton'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import './PasswordStrength.css'

interface SignupErrors {
  name?: string
  email?: string
  password?: string
  confirm?: string
}

export function SignupPage() {
  const { t } = useTranslation()
  const { user } = useSession()
  const [nameLength, setNameLength] = useState(0)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<SignupErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const fullName = normalizePersonName(String(data.get('fullName') ?? ''))
    const email = String(data.get('email') ?? '').trim()
    const chosenPassword = password
    const repeated = confirm

    const next: SignupErrors = {}
    const nameCheck = validatePersonName(fullName)
    if (nameCheck) next.name = t(nameCheck.key, nameCheck.values)
    const emailCheck = validateEmail(email)
    if (emailCheck) next.email = t(emailCheck.key, emailCheck.values)
    if (chosenPassword.length < PASSWORD_MIN_LENGTH)
      next.password = t('auth.validation.passwordMin')
    else if (passwordStrength(chosenPassword) === 0) next.password = t('auth.errors.weakPassword')
    if (repeated !== chosenPassword) next.confirm = t('auth.validation.passwordMismatch')
    setErrors(next)

    // Password fields are cleared on every submit, valid or not.
    setPassword('')
    setConfirm('')
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    setErrorKey(null)
    const { error } = await supabase.auth.signUp({
      email,
      password: chosenPassword,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: appUrl('/auth/callback'),
      },
    })
    setSubmitting(false)

    const key = error ? authErrorKey(error, 'signup') : null
    // Existing accounts get the same "check your email" answer (no account enumeration).
    if (key === null || key === 'auth.signupSent') {
      setSent(true)
      return
    }
    setErrorKey(key)
  }

  if (sent) {
    return (
      <AuthLayout title={t('auth.checkEmailTitle')} subtitle={t('auth.checkEmailText')}>
        <Alert tone="success" live="polite" title={t('auth.checkEmailAlertTitle')}>
          {t('auth.checkEmailHint')}
        </Alert>
        <span className="auth__sent-icon" aria-hidden="true">
          <MailCheck size={30} />
        </span>
        <ButtonLink to="/login" variant="secondary" block>
          {t('auth.backToLogin')}
        </ButtonLink>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={t('auth.signupTitle')}
      subtitle={t('auth.signupSubtitle')}
      footer={
        <>
          {t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link>
        </>
      }
    >
      {errorKey && (
        <Alert tone="danger" live="assertive">
          {t(errorKey)}
        </Alert>
      )}
      <GoogleButton onError={setErrorKey} />
      <p className="auth__divider">{t('auth.orEmail')}</p>
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <Field
          label={t('auth.fullName')}
          error={errors.name}
          hint={t('auth.validation.nameCounter', { count: nameLength, max: PERSON_NAME_MAX })}
        >
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="fullName"
              autoComplete="name"
              maxLength={PERSON_NAME_MAX}
              required
              onChange={(event) => setNameLength(event.target.value.length)}
              icon={<UserRound size={16} />}
              placeholder={t('auth.fullNamePlaceholder')}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <Field label={t('auth.email')} error={errors.email}>
          {({ id, describedBy, invalid }) => (
            <TextInput
              id={id}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={EMAIL_MAX}
              required
              icon={<Mail size={16} />}
              placeholder={t('auth.emailPlaceholder')}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
            />
          )}
        </Field>
        <Field label={t('auth.password')} error={errors.password}>
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
          icon={<UserPlus size={18} aria-hidden="true" />}
        >
          {t('auth.signup')}
        </Button>
        <p className="auth__note">{t('auth.signupRoleNote')}</p>
      </form>
    </AuthLayout>
  )
}
