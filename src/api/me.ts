import type { AuthUser } from '../auth/authContext'
import { isRoleCode, type RoleCode } from '../auth/roles'
import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import { MOCK_AUTH_USER, MOCK_ROLE } from './mock/mockIdentity'

export interface Me {
  id: string
  fullName: string
  email: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: string | null
  /** Highest role the user holds, or null if none (should not happen: sign-up grants viewer). */
  role: RoleCode | null
}

const ROLE_RANK: Record<RoleCode, number> = { admin: 3, teacher: 2, viewer: 1 }

function pickHighestRole(codes: string[]): RoleCode | null {
  const valid = codes.filter(isRoleCode)
  if (valid.length === 0) return null
  return valid.reduce((best, code) => (ROLE_RANK[code] > ROLE_RANK[best] ? code : best))
}

function fallbackName(user: AuthUser): string {
  return user.metadataName ?? user.email?.split('@')[0] ?? 'Usuario'
}

/** Own profile + role. RLS lets every signed-in user read their own rows, even if inactive. */
export async function fetchMe(user: AuthUser): Promise<Me> {
  if (isMockMode) {
    return {
      id: MOCK_AUTH_USER.id,
      fullName: fallbackName(MOCK_AUTH_USER),
      email: MOCK_AUTH_USER.email,
      avatarUrl: null,
      isActive: true,
      createdAt: '2026-09-28T14:00:00Z',
      role: MOCK_ROLE,
    }
  }

  const [profileResult, rolesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, is_active, created_at')
      .eq('id', user.id)
      .maybeSingle(),
    supabase.from('user_roles').select('roles(code)').eq('user_id', user.id),
  ])
  if (profileResult.error) throw profileResult.error
  if (rolesResult.error) throw rolesResult.error

  const profile = profileResult.data
  const codes = (rolesResult.data ?? []).flatMap((row) => (row.roles ? [row.roles.code] : []))

  return {
    id: user.id,
    fullName: profile?.full_name?.trim() || fallbackName(user),
    email: profile?.email ?? user.email,
    avatarUrl: profile?.avatar_url ?? user.metadataAvatarUrl,
    isActive: profile?.is_active ?? false,
    createdAt: profile?.created_at ?? null,
    role: pickHighestRole(codes),
  }
}

export const FULL_NAME_MAX = 120

/** Own display name. RLS only allows active accounts to edit their own profile row. */
export async function updateMyName(userId: string, fullName: string): Promise<void> {
  if (isMockMode) return
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim().slice(0, FULL_NAME_MAX) })
    .eq('id', userId)
  if (error) throw error
}
