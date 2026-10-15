import { useSession } from '../auth/authContext'
import { useMe } from '../auth/useRole'
import { TopProgressBar } from '../components/ui/TopProgressBar'
import { useAlerts } from '../hooks/queries'
import { LiveIndicator } from '../realtime/LiveIndicator'
import { RealtimeProvider } from '../realtime/RealtimeProvider'
import { AppShell, type ShellUser } from './AppShell'

/** Authenticated layout (rendered behind RequireRole): Realtime + shell with the profile. */
export function ShellRoute() {
  const { user } = useSession()
  return (
    <RealtimeProvider enabled={user !== null}>
      <ShellContent />
    </RealtimeProvider>
  )
}

function ShellContent() {
  const { user, signOut } = useSession()
  const me = useMe()
  // Inside the provider so the bell counter follows the Realtime/fallback refresh rules.
  const openAlerts = useAlerts('open')

  const shellUser: ShellUser = {
    name: me.data?.fullName ?? user?.metadataName ?? user?.email ?? '',
    email: me.data?.email ?? user?.email ?? null,
    avatarUrl: me.data?.avatarUrl ?? user?.metadataAvatarUrl ?? null,
    role: me.data?.role ?? 'viewer',
  }

  return (
    <AppShell
      user={shellUser}
      onSignOut={() => void signOut()}
      openAlerts={openAlerts.data?.length ?? 0}
      topSlot={<TopProgressBar />}
      liveIndicator={<LiveIndicator />}
    />
  )
}
