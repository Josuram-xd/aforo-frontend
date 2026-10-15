import { KeyRound, Mail, MailCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { authErrorKey } from '../../auth/authErrors'
import { appUrl } from '../../auth/redirect'
import { Alert } from '../../components/ui/Alert'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Field, TextInput } from '../../components/ui/Field'
import { supabase } from '../../lib/supabase'
import { EMAIL_MAX, validateEmail } from '../../lib/validation'
import { AuthLayout } from './AuthLayout'

/** Step 1 of the reset: always answers the same way, whether or not the email exists. */
export function RequestResetPage() {
  const { t } = useTranslation()
  const [emailError, setEmailError] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    const emailCheck = validateEmail(email)
    if (emailCheck) {
      setEmailError(t(emailCheck.key, emailCheck.values))
      return
    }
    setEmailError(null)
    setErrorKey(null)
    setSubmitting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: appUrl('/recuperar/nueva'),
    })
    setSubmitting(false)

    const key = error ? authErrorKey(error, 'reset') : null
    // Only rate limits and network problems are worth telling; anything else looks like success.
    if (
      key === 'auth.errors.rateLimited' ||
      key === 'auth.errors.emailRateLimited' ||
      key === 'auth.errors.network'
    ) {
      setErrorKey(key)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title={t('auth.checkEmailTitle')} subtitle={t('auth.resetSentText')}>
        <span className="auth__sent-icon" aria-hidden="true">
          <MailCheck size={30} />
        </span>
        <Alert tone="info" live="polite">
          {t('auth.checkEmailHint')}
        </Alert>
        <ButtonLink to="/login" variant="secondary" block>
          {t('auth.backToLogin')}
        </ButtonLink>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={t('auth.resetTitle')}
      subtitle={t('auth.resetSubtitle')}
      footer={
        <>
          {t('auth.rememberedIt')} <Link to="/login">{t('auth.login')}</Link>
        </>
      }
    >
      {errorKey && (
        <Alert tone="danger" live="assertive">
          {t(errorKey)}
        </Alert>
      )}
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        <Field label={t('auth.email')} error={emailError}>
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
        <Button
          type="submit"
          size="lg"
          block
          loading={submitting}
          icon={<KeyRound size={18} aria-hidden="true" />}
        >
          {t('auth.sendResetLink')}
        </Button>
      </form>
    </AuthLayout>
  )
}
