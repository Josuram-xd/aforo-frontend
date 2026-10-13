import { Navigate, useLocation } from 'react-router'
import { useSession } from '../auth/authContext'
import { useMe } from '../auth/useRole'
import { FullPageLoader } from '../components/FullPageLoader'
import { TopProgressBar } from '../components/ui/TopProgressBar'
import { LiveIndicator } from '../realtime/LiveIndicator'
import { RealtimeProvider } from '../realtime/RealtimeProvider'
import { AppShell, type ShellUser } from './AppShell'

/** Authenticated layout: Realtime + shell fed with the current profile and role. */
export function ShellRoute() {
  const { user, loading, signOut } = useSession()
  const me = useMe()
  const location = useLocation()

  if (loading) return <FullPageLoader />
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />

  const shellUser: ShellUser = {
    name: me.data?.fullName ?? user?.metadataName ?? user?.email ?? '',
    email: me.data?.email ?? user?.email ?? null,
    avatarUrl: me.data?.avatarUrl ?? user?.metadataAvatarUrl ?? null,
    role: me.data?.role ?? 'viewer',
  }

  return (
    <RealtimeProvider enabled={user !== null}>
      <AppShell
        user={shellUser}
        onSignOut={() => void signOut()}
        topSlot={<TopProgressBar />}
        liveIndicator={<LiveIndicator />}
      />
    </RealtimeProvider>
  )
}
