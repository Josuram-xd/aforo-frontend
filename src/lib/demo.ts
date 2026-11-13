import { isRoleCode, type RoleCode } from '../auth/roles'

// Demo mode: the /demo route turns on the sample-data (mock) API for this browser tab only.
// Nothing here talks to Supabase, creates a session or grants real permissions.

const DEMO_KEY = 'aforo.demo'
export const DEMO_QUERY_PARAM = 'demo'

/** Reads the role saved by /demo; `unavailable` means the browser blocked sessionStorage. */
function readStored(): { role: RoleCode | null; unavailable: boolean } {
  try {
    const value = window.sessionStorage.getItem(DEMO_KEY)
    return { role: isRoleCode(value) ? value : null, unavailable: false }
  } catch {
    return { role: null, unavailable: true }
  }
}

function computeRole(): RoleCode | null {
  if (typeof window === 'undefined') return null
  const stored = readStored()
  if (stored.role || !stored.unavailable) return stored.role
  // Storage is blocked: /demo passed the role in the URL; keep it in memory for this page load.
  // Only honoured in this case, so a normal visit with `?demo=` does nothing.
  const param = new URLSearchParams(window.location.search).get(DEMO_QUERY_PARAM)
  return isRoleCode(param) ? param : null
}

// Evaluated once when the module loads, like `isMockMode`: switching needs a full reload.
const activeRole = computeRole()

export const demoActive = (): boolean => activeRole !== null

/** Simulated role of the demo, or null when the demo is off. */
export const demoRole = (): RoleCode | null => activeRole

/** Invalid or missing values fall back to admin. */
export function parseDemoRole(value: unknown): RoleCode {
  return isRoleCode(value) ? value : 'admin'
}

/** Turns the demo on and reloads the app at its home page. */
export function activateDemo(role: RoleCode): void {
  try {
    window.sessionStorage.setItem(DEMO_KEY, role)
    window.location.replace('/')
  } catch {
    window.location.replace(`/?${DEMO_QUERY_PARAM}=${role}`)
  }
}

/** Turns the demo off and reloads at the real login. */
export function exitDemo(): void {
  try {
    window.sessionStorage.removeItem(DEMO_KEY)
  } catch {
    // Nothing stored; the reload below drops the in-memory flag anyway.
  }
  window.location.assign('/login')
}
