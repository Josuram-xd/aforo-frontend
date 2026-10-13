import { TopProgressBar } from '../components/ui/TopProgressBar'
import { LiveIndicator } from '../realtime/LiveIndicator'
import { RealtimeProvider } from '../realtime/RealtimeProvider'
import { AppShell, type ShellUser } from './AppShell'

// Placeholder identity until the auth provider lands (task 13).
const PREVIEW_USER: ShellUser = {
  name: 'Usuario de prueba',
  email: null,
  avatarUrl: null,
  role: 'admin',
}

export function ShellRoute() {
  return (
    <RealtimeProvider enabled>
      <AppShell
        user={PREVIEW_USER}
        onSignOut={() => undefined}
        topSlot={<TopProgressBar />}
        liveIndicator={<LiveIndicator />}
      />
    </RealtimeProvider>
  )
}
