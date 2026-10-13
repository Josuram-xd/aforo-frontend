import { TopProgressBar } from '../components/ui/TopProgressBar'
import { AppShell, type ShellUser } from './AppShell'

// Placeholder identity until the auth provider lands (task 13).
const PREVIEW_USER: ShellUser = {
  name: 'Usuario de prueba',
  email: null,
  avatarUrl: null,
  role: 'admin',
}

export function ShellRoute() {
  return <AppShell user={PREVIEW_USER} onSignOut={() => undefined} topSlot={<TopProgressBar />} />
}
