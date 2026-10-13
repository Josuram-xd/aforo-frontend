import { useQuery } from '@tanstack/react-query'
import { fetchMe, type Me } from '../api/me'
import { queryKeys } from '../api/queryKeys'
import { useSession } from './authContext'
import type { RoleCode } from './roles'

/** Own profile and role, read once per session (ARCHITECTURE.md §8.3) and cached. */
export function useMe() {
  const { user } = useSession()
  return useQuery<Me>({
    queryKey: [...queryKeys.me, user?.id],
    queryFn: () => fetchMe(user!),
    enabled: user !== null,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

/**
 * Current role for UI decisions. `null` while loading, without session, without role or with a
 * deactivated account. Only UX: RLS in aforo-db is what actually protects the data.
 */
export function useRole(): { role: RoleCode | null; isPending: boolean } {
  const { user, loading } = useSession()
  const me = useMe()
  if (loading || (user !== null && me.isPending)) return { role: null, isPending: true }
  const role = me.data?.isActive ? me.data.role : null
  return { role, isPending: false }
}
