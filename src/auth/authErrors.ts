import { isAuthError } from '@supabase/supabase-js'

/**
 * Maps a Supabase Auth error to an i18n key. Messages are deliberately generic: they never say
 * whether an email is registered, and raw server messages are never shown or logged.
 */
export function authErrorKey(
  error: unknown,
  context: 'login' | 'signup' | 'reset' | 'update',
): string {
  if (!isAuthError(error)) return 'auth.errors.generic'

  if (error.status === 429 || error.code === 'over_request_rate_limit') {
    return 'auth.errors.rateLimited'
  }
  if (error.code === 'over_email_send_rate_limit') return 'auth.errors.emailRateLimited'
  if (error.status === 0 || error.name === 'AuthRetryableFetchError') return 'auth.errors.network'

  switch (error.code) {
    case 'invalid_credentials':
    case 'user_not_found':
      return 'auth.errors.invalidCredentials'
    case 'email_not_confirmed':
      return 'auth.errors.emailNotConfirmed'
    case 'user_banned':
      return 'auth.errors.accountBlocked'
    case 'weak_password':
      return 'auth.errors.weakPassword'
    case 'same_password':
      return 'auth.errors.samePassword'
    case 'email_address_invalid':
      return 'auth.errors.invalidEmail'
    case 'signup_disabled':
      return 'auth.errors.signupDisabled'
    case 'session_not_found':
    case 'session_expired':
    case 'flow_state_expired':
    case 'flow_state_not_found':
    case 'bad_code_verifier':
    case 'otp_expired':
      return 'auth.errors.linkExpired'
    // Sign-up must not reveal existing accounts: report it as if the email was sent.
    case 'user_already_exists':
    case 'email_exists':
      return context === 'signup' ? 'auth.signupSent' : 'auth.errors.generic'
    default:
      return context === 'login' ? 'auth.errors.loginFailed' : 'auth.errors.generic'
  }
}
