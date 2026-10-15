import { describe, expect, it } from 'vitest'
import {
  EMAIL_MAX,
  PERSON_NAME_MAX,
  normalizePersonName,
  validateEmail,
  validatePersonName,
} from './validation'

describe('validateEmail', () => {
  it.each(['ana@gmail.com', 'ana.perez+aforo@uni.edu.co', 'A_B-1@sub.dominio.org'])(
    'accepts %s',
    (email) => {
      expect(validateEmail(email)).toBeNull()
    },
  )

  it.each([
    'ana',
    'ana@',
    '@gmail.com',
    'ana@gmail',
    'ana@gmail.c',
    'ana gomez@gmail.com',
    'ana@@gmail.com',
    'ana..p@gmail.com',
    '.ana@gmail.com',
    'ana@-gmail.com',
    'ana@gmail..com',
  ])('rejects %s', (email) => {
    expect(validateEmail(email)?.key).toBe('auth.validation.email')
  })

  it('asks for the email when empty and limits its length', () => {
    expect(validateEmail('   ')?.key).toBe('auth.validation.emailRequired')
    const long = `${'a'.repeat(EMAIL_MAX)}@gmail.com`
    expect(validateEmail(long)?.key).toBe('auth.validation.emailTooLong')
  })
})

describe('validatePersonName', () => {
  it.each(['Ana', 'José Ramírez', "D'Angelo O’Neil", 'María-José Peña Ñuñez', 'J. R. R. Tolkien'])(
    'accepts %s',
    (name) => {
      expect(validatePersonName(name)).toBeNull()
    },
  )

  it('rejects empty, short, long and symbol names', () => {
    expect(validatePersonName('  ')?.key).toBe('auth.validation.nameRequired')
    expect(validatePersonName('Al')?.key).toBe('auth.validation.nameTooShort')
    expect(validatePersonName('a'.repeat(PERSON_NAME_MAX + 1))?.key).toBe(
      'auth.validation.nameTooLong',
    )
    expect(validatePersonName('Ana123')?.key).toBe('auth.validation.nameInvalid')
    expect(validatePersonName('<script>')?.key).toBe('auth.validation.nameInvalid')
    expect(validatePersonName('-Ana')?.key).toBe('auth.validation.nameInvalid')
  })

  it('collapses repeated spaces before measuring', () => {
    expect(normalizePersonName('  Ana    María  ')).toBe('Ana María')
    expect(validatePersonName(`Ana${' '.repeat(80)}María`)).toBeNull()
  })
})
