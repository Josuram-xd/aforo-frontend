// Invited users (invite-user Edge Function) arrive through an email link with a session but no
// password. They must choose one before using the app; this flag survives reloads in the tab.

const STORAGE_KEY = 'aforo.must-set-password'

/** Reads the auth link type from the URL before supabase-js consumes and clears it. */
export function captureAuthLinkType(location: Location): void {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''))
  const query = new URLSearchParams(location.search)
  const type = hash.get('type') ?? query.get('type')
  if (type === 'invite') {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Without storage the user simply is not forced to the password step.
    }
  }
}

export function mustSetPassword(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function clearMustSetPassword(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}

export const SET_PASSWORD_PATH = '/recuperar/nueva?invitacion=1'
