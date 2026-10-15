// Shared form rules for people's names and email addresses. Each check returns an i18n key
// (with its interpolation values) or null when the value is valid.

export const EMAIL_MAX = 254
export const PERSON_NAME_MIN = 3
export const PERSON_NAME_MAX = 60

// local@domain.tld: no spaces, a dot-separated domain and a top-level domain of 2+ letters.
const EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/

// Letters (any language, with accents), spaces, dots, apostrophes and hyphens; starts with a letter.
const NAME_PATTERN = /^\p{L}[\p{L}\p{M} .'’-]*$/u

export interface ValidationError {
  key: string
  values?: Record<string, number>
}

export function validateEmail(raw: string): ValidationError | null {
  const email = raw.trim()
  if (email === '') return { key: 'auth.validation.emailRequired' }
  if (email.length > EMAIL_MAX)
    return { key: 'auth.validation.emailTooLong', values: { max: EMAIL_MAX } }
  const local = email.split('@')[0] ?? ''
  if (
    !EMAIL_PATTERN.test(email) ||
    email.includes('..') ||
    local.startsWith('.') ||
    local.endsWith('.')
  ) {
    return { key: 'auth.validation.email' }
  }
  return null
}

/** Collapses repeated spaces so "Ana   María" is stored as "Ana María". */
export function normalizePersonName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

export function validatePersonName(raw: string): ValidationError | null {
  const name = normalizePersonName(raw)
  if (name === '') return { key: 'auth.validation.nameRequired' }
  if (name.length < PERSON_NAME_MIN)
    return { key: 'auth.validation.nameTooShort', values: { min: PERSON_NAME_MIN } }
  if (name.length > PERSON_NAME_MAX)
    return { key: 'auth.validation.nameTooLong', values: { max: PERSON_NAME_MAX } }
  if (!NAME_PATTERN.test(name)) return { key: 'auth.validation.nameInvalid' }
  return null
}
