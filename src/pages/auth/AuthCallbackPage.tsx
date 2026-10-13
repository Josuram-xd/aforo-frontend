import { TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router'
import { logAccess } from '../../api/accessLog'
import { useSession } from '../../auth/authContext'
import { FullPageLoader } from '../../components/FullPageLoader'
import { Alert } from '../../components/ui/Alert'
import { ButtonLink } from '../../components/ui/Button'
import { AuthLayout } from './AuthLayout'

/** How long to wait for supabase-js to exchange the PKCE code before giving up. */
const EXCHANGE_TIMEOUT_MS = 12_000

function readCallbackError(): boolean {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return query.has('error') || hash.has('error') || query.has('error_code')
}

/**
 * Landing page for Google sign-in and email confirmation links. supabase-js exchanges the
 * `?code=` for a session on load (detectSessionInUrl + PKCE); this page only waits for it.
 * Provider error descriptions are not echoed back to the user.
 */
export function AuthCallbackPage() {
  const { t } = useTranslation()
  const { user, loading } = useSession()
  const [failed, setFailed] = useState(readCallbackError)

  useEffect(() => {
    if (user) void logAccess('LOGIN', 'oauth_or_email_link')
  }, [user])

  useEffect(() => {
    if (user || failed) return
    const timer = setTimeout(() => setFailed(true), EXCHANGE_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [user, failed])

  if (user) return <Navigate to="/" replace />

  if (failed && !loading) {
    return (
      <AuthLayout title={t('auth.callbackFailedTitle')}>
        <Alert tone="danger" live="assertive" title={t('auth.callbackFailedAlert')}>
          {t('auth.errors.linkExpired')}
        </Alert>
        <span className="auth__sent-icon auth__sent-icon--danger" aria-hidden="true">
          <TriangleAlert size={28} />
        </span>
        <ButtonLink to="/login" variant="primary" block>
          {t('auth.backToLogin')}
        </ButtonLink>
      </AuthLayout>
    )
  }

  return <FullPageLoader />
}
