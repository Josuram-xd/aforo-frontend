// Client-side brake on repeated failed logins. Supabase rate-limits on the server too; this only
// slows down guessing from this tab and gives clear feedback. Stores counters, never credentials.

const STORAGE_KEY = 'aforo.login-throttle'
/** Failures allowed before the first lock. */
const FREE_ATTEMPTS = 3
const BASE_LOCK_MS = 15_000
const MAX_LOCK_MS = 5 * 60_000

interface ThrottleState {
  failures: number
  lockedUntil: number
}

function read(): ThrottleState {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '') as Partial<ThrottleState>
    return {
      failures: Number.isFinite(parsed.failures) ? Number(parsed.failures) : 0,
      lockedUntil: Number.isFinite(parsed.lockedUntil) ? Number(parsed.lockedUntil) : 0,
    }
  } catch {
    return { failures: 0, lockedUntil: 0 }
  }
}

function write(state: ThrottleState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Without storage the lock only lasts while the page is open.
  }
}

/** Milliseconds left before another attempt is allowed (0 = allowed now). */
export function lockRemainingMs(now = Date.now()): number {
  return Math.max(0, read().lockedUntil - now)
}

/** Records a failed attempt and returns the lock duration that now applies (0 = none). */
export function registerFailure(now = Date.now()): number {
  const failures = read().failures + 1
  const extra = failures - FREE_ATTEMPTS
  const lockMs = extra > 0 ? Math.min(BASE_LOCK_MS * 2 ** (extra - 1), MAX_LOCK_MS) : 0
  write({ failures, lockedUntil: lockMs > 0 ? now + lockMs : 0 })
  return lockMs
}

export function resetFailures(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to reset.
  }
}
