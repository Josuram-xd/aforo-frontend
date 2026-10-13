import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageLoader } from '../components/FullPageLoader'
import { ErrorState } from '../components/ui/ErrorState'
import { AccountBlockedPage } from '../pages/AccountBlockedPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { useSession } from './authContext'
import { canAccess, type RoleCode } from './roles'
import { useMe } from './useRole'

interface RequireRoleProps {
  /** Roles allowed in; an empty list means any signed-in, active account. */
  roles: readonly RoleCode[]
  children?: ReactNode
}

/**
 * Route guard (UX only — RLS in aforo-db is the real access control):
 * no session → /login, deactivated or role-less account → blocked page, wrong role → "No tienes
 * permiso". Renders `children` or the nested routes.
 */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, loading } = useSession()
  const me = useMe()
  const location = useLocation()

  if (loading) return <FullPageLoader />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (me.isPending) return <FullPageLoader />
  if (me.isError) {
    return <ErrorState onRetry={() => void me.refetch()} retrying={me.isFetching} />
  }
  if (!me.data.isActive || me.data.role === null) {
    return <AccountBlockedPage reason={me.data.isActive ? 'noRole' : 'inactive'} />
  }
  if (!canAccess(me.data.role, roles)) return <ForbiddenPage />

  return children ?? <Outlet />
}
