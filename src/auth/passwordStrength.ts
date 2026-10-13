export const PASSWORD_MIN_LENGTH = 8

export type StrengthLevel = 0 | 1 | 2 | 3 | 4

const COMMON_PASSWORDS = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password1',
  'contraseña',
  'qwertyui',
  'qwerty123',
  '11111111',
  'iloveyou',
  'abc12345',
  'aforo123',
])

/**
 * Simple strength score for the meter (0 = very weak … 4 = strong). It is a hint for the user;
 * the server-side rules in Supabase Auth are what actually accept or reject a password.
 */
export function passwordStrength(password: string): StrengthLevel {
  if (password.length === 0) return 0
  if (password.length < PASSWORD_MIN_LENGTH || COMMON_PASSWORDS.has(password.toLowerCase())) {
    return 0
  }

  let score = 0
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (/(.)\1{2,}/.test(password)) score -= 1

  return Math.max(1, Math.min(4, score)) as StrengthLevel
}
