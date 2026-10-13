import { useSession } from '../auth/authContext'
import { useMe } from '../auth/useRole'
import { TopProgressBar } from '../components/ui/TopProgressBar'
import { LiveIndicator } from '../realtime/LiveIndicator'
import { RealtimeProvider } from '../realtime/RealtimeProvider'
import { AppShell, type ShellUser } from './AppShell'

/** Authenticated layout (rendered behind RequireRole): Realtime + shell with the profile. */
export function ShellRoute() {
  const { user, signOut } = useSession()
  const me = useMe()

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
