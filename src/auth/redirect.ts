/**
 * Returns an in-app path to go back to after signing in, or "/" when the value is missing or
 * could leave the app (absolute URLs, protocol-relative "//host", backslashes). Prevents open
 * redirects through the `from` state or query string.
 */
export function safeRedirectPath(value: unknown): string {
  if (typeof value !== 'string') return '/'
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/'
  if (value.startsWith('/login') || value.startsWith('/auth/')) return '/'
  return value
}

/** Absolute URL of an in-app route, used for Supabase email links and OAuth redirects. */
export function appUrl(path: string): string {
  return new URL(path, window.location.origin).toString()
}
