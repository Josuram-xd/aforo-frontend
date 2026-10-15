import { isRoleCode, type RoleCode } from '../auth/roles'
import { endOfBogotaDay, startOfBogotaDay } from '../lib/format'
import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import { fromFunctionError, fromPostgrest } from './errors'
import type { AuditFilters, AuditItem, Page, UserItem } from './types'

// Admin-only data: other profiles, roles and the audit log. RLS returns only the caller's own
// rows to non-admins, and the RPCs/Edge Function re-check the admin role server-side.

const mock = () => import('./mock/mockApi')

const ROLE_RANK: Record<RoleCode, number> = { admin: 3, teacher: 2, viewer: 1 }

export async function fetchUsers(): Promise<UserItem[]> {
  if (isMockMode) return (await mock()).fetchUsers()
  const [profiles, roles] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, is_active, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('user_roles').select('user_id, roles(code)'),
  ])
  if (profiles.error) throw fromPostgrest(profiles.error)
  if (roles.error) throw fromPostgrest(roles.error)

  const roleByUser = new Map<string, RoleCode>()
  for (const row of roles.data) {
    const code = row.roles?.code
    if (!isRoleCode(code)) continue
    const current = roleByUser.get(row.user_id)
    if (!current || ROLE_RANK[code] > ROLE_RANK[current]) roleByUser.set(row.user_id, code)
  }

  return profiles.data.map((profile) => ({
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    isActive: profile.is_active,
    createdAt: profile.created_at,
    role: roleByUser.get(profile.id) ?? null,
  }))
}

export async function setUserRole(userId: string, role: RoleCode): Promise<void> {
  if (isMockMode) return (await mock()).setUserRole(userId, role)
  const { error } = await supabase.rpc('set_user_role', { p_user_id: userId, p_role_code: role })
  if (error) throw fromPostgrest(error)
}

export async function setUserActive(userId: string, active: boolean): Promise<void> {
  if (isMockMode) return (await mock()).setUserActive(userId, active)
  const { error } = await supabase.rpc('set_user_active', { p_user_id: userId, p_active: active })
  if (error) throw fromPostgrest(error)
}

/** Invitation email through the `invite-user` Edge Function (aforo-backend). */
export async function inviteUser(email: string, role: RoleCode): Promise<void> {
  if (isMockMode) return (await mock()).inviteUser(email, role)
  const { error } = await supabase.functions.invoke('invite-user', {
    method: 'POST',
    body: { email, role },
  })
  if (error) throw await fromFunctionError(error)
}

export const AUDIT_PAGE_SIZE = 25

export async function fetchAuditPage(
  filters: AuditFilters,
  page: number,
): Promise<Page<AuditItem>> {
  if (isMockMode) return (await mock()).fetchAuditPage(filters, page)
  const fromRow = page * AUDIT_PAGE_SIZE
  let query = supabase
    .from('audit_log')
    .select('*, profiles(full_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(fromRow, fromRow + AUDIT_PAGE_SIZE - 1)
  if (filters.actorId) query = query.eq('actor_id', filters.actorId)
  if (filters.action) query = query.eq('action', filters.action)
  if (filters.tableName) query = query.eq('table_name', filters.tableName)
  if (filters.from) query = query.gte('created_at', startOfBogotaDay(filters.from))
  if (filters.to) query = query.lt('created_at', endOfBogotaDay(filters.to))

  const { data, error, count } = await query
  if (error) throw fromPostgrest(error)
  return {
    total: count ?? 0,
    rows: data.map((row) => ({
      id: row.id,
      action: row.action,
      actorId: row.actor_id,
      actorName: row.profiles?.full_name ?? null,
      actorEmail: row.profiles?.email ?? null,
      tableName: row.table_name,
      recordId: row.record_id,
      oldData: row.old_data,
      newData: row.new_data,
      createdAt: row.created_at,
    })),
  }
}
