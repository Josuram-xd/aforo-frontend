export const ROLE_CODES = ['admin', 'teacher', 'viewer'] as const

export type RoleCode = (typeof ROLE_CODES)[number]

export function isRoleCode(value: unknown): value is RoleCode {
  return typeof value === 'string' && (ROLE_CODES as readonly string[]).includes(value)
}

/**
 * UI-only check: hides what a role cannot open. The real guard is RLS in aforo-db.
 * An empty `allowed` list means "any signed-in role".
 */
export function canAccess(role: RoleCode | null, allowed: readonly RoleCode[]): boolean {
  if (role === null) return false
  return allowed.length === 0 || allowed.includes(role)
}

export const STAFF_ROLES: readonly RoleCode[] = ['admin', 'teacher']
export const ADMIN_ROLES: readonly RoleCode[] = ['admin']
