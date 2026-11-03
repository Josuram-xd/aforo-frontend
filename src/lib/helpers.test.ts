import { AuthApiError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import type { EventItem } from '../api/types'
import { authErrorKey } from '../auth/authErrors'
import { lockRemainingMs, registerFailure, resetFailures } from '../auth/loginThrottle'
import { passwordStrength } from '../auth/passwordStrength'
import { safeRedirectPath } from '../auth/redirect'
import { canAccess } from '../auth/roles'
import { capacityLevel } from './capacity'
import { addDays, bogotaDay, startOfBogotaDay } from './format'
import { bucketByHour } from './hourBuckets'

describe('capacityLevel', () => {
  it('uses 80 % and 100 % as thresholds', () => {
    expect(capacityLevel(23, 30)).toBe('normal')
    expect(capacityLevel(24, 30)).toBe('high')
    expect(capacityLevel(30, 30)).toBe('high')
    expect(capacityLevel(31, 30)).toBe('over')
  })
})

describe('canAccess', () => {
  it('treats roles as UI hints with an explicit allow list', () => {
    expect(canAccess('viewer', ['admin', 'teacher'])).toBe(false)
    expect(canAccess('teacher', ['admin', 'teacher'])).toBe(true)
    expect(canAccess('viewer', [])).toBe(true)
    expect(canAccess(null, [])).toBe(false)
  })
})

describe('safeRedirectPath', () => {
  it('only allows in-app paths', () => {
    expect(safeRedirectPath('/eventos?desde=2026-10-01')).toBe('/eventos?desde=2026-10-01')
    expect(safeRedirectPath('https://evil.example')).toBe('/')
    expect(safeRedirectPath('//evil.example')).toBe('/')
    expect(safeRedirectPath('/\\evil.example')).toBe('/')
    expect(safeRedirectPath('/login')).toBe('/')
    expect(safeRedirectPath(undefined)).toBe('/')
  })
})

describe('passwordStrength', () => {
  it('rejects short and common passwords', () => {
    expect(passwordStrength('Ab1!')).toBe(0)
    expect(passwordStrength('12345678')).toBe(0)
  })

  it('rewards length and variety', () => {
    expect(passwordStrength('abcdefgh')).toBe(1)
    expect(passwordStrength('Correcto-Caballo-42')).toBe(4)
  })
})

describe('login throttle', () => {
  it('locks after three failures and grows the lock', () => {
    resetFailures()
    expect(registerFailure(0)).toBe(0)
    expect(registerFailure(0)).toBe(0)
    expect(registerFailure(0)).toBe(0)
    expect(registerFailure(0)).toBe(15_000)
    expect(lockRemainingMs(5_000)).toBe(10_000)
    expect(registerFailure(0)).toBe(30_000)
    resetFailures()
    expect(lockRemainingMs(0)).toBe(0)
  })
})

describe('authErrorKey', () => {
  it('never reveals whether an email exists', () => {
    const invalid = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials')
    const exists = new AuthApiError('User already registered', 422, 'user_already_exists')
    expect(authErrorKey(invalid, 'login')).toBe('auth.errors.invalidCredentials')
    expect(authErrorKey(exists, 'signup')).toBe('auth.signupSent')
  })

  it('maps rate limits', () => {
    const limited = new AuthApiError('Too many', 429, 'over_request_rate_limit')
    expect(authErrorKey(limited, 'login')).toBe('auth.errors.rateLimited')
  })
})

describe('Bogotá time helpers', () => {
  it('start the day at 05:00 UTC (UTC-5, no DST)', () => {
    expect(startOfBogotaDay('2026-10-13')).toBe('2026-10-13T05:00:00.000Z')
    expect(bogotaDay('2026-10-14T04:59:00Z')).toBe('2026-10-13')
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
  })

  it('buckets events per Bogotá hour from 06:00 to 20:00', () => {
    const event = (iso: string, direction: 'ENTRY' | 'EXIT') =>
      ({ occurredAt: iso, direction }) as EventItem
    const buckets = bucketByHour([
      event('2026-10-13T12:10:00Z', 'ENTRY'), // 07:10 Bogotá
      event('2026-10-13T12:50:00Z', 'ENTRY'),
      event('2026-10-13T13:05:00Z', 'EXIT'), // 08:05
    ])
    expect(buckets[0]?.label).toBe('06:00')
    expect(buckets.at(-1)?.label).toBe('20:00')
    expect(buckets.find((b) => b.hour === 7)).toMatchObject({ entries: 2, exits: 0 })
    expect(buckets.find((b) => b.hour === 8)).toMatchObject({ entries: 0, exits: 1 })
  })
})
