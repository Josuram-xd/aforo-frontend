import { useEffect } from 'react'
import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'

export type AccessAction = 'LOGIN' | 'LOGOUT' | 'VIEW' | 'EXPORT'

/** Resources whose views are audited (sensitive personal data, ARCHITECTURE.md §8.3). */
export type AuditedResource = 'students' | 'events' | 'audit_log' | 'attendance'

/**
 * Writes to audit_log through the `log_access` RPC (the server stamps the user and time).
 * Best effort: a failed log never blocks the user and is not printed to the console.
 */
export async function logAccess(action: AccessAction, resource?: string): Promise<void> {
  if (isMockMode) return
  try {
    await supabase.rpc('log_access', { p_action: action, p_resource: resource })
  } catch {
    // Ignored on purpose (see above).
  }
}

// React StrictMode mounts effects twice in development; skip a repeat within this window.
const DEDUPE_MS = 2_000
const lastLogged = new Map<string, number>()

/** Logs a VIEW of `resource` once each time the page is opened. */
export function useLogView(resource: AuditedResource): void {
  useEffect(() => {
    const now = Date.now()
    if (now - (lastLogged.get(resource) ?? 0) < DEDUPE_MS) return
    lastLogged.set(resource, now)
    void logAccess('VIEW', resource)
  }, [resource])
}
