import { LogOut, UserX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSession } from '../auth/authContext'
import { Button } from '../components/ui/Button'
import { AuthLayout } from './auth/AuthLayout'

interface AccountBlockedPageProps {
  reason: 'inactive' | 'noRole'
}

/** Shown to signed-in accounts that RLS will not let read anything. */
export function AccountBlockedPage({ reason }: AccountBlockedPageProps) {
  const { t } = useTranslation()
  const { signOut } = useSession()
  return (
    <AuthLayout title={t(`auth.blocked.${reason}Title`)} subtitle={t(`auth.blocked.${reason}Text`)}>
      <span className="auth__sent-icon auth__sent-icon--danger" aria-hidden="true">
        <UserX size={28} />
      </span>
      <Button
        variant="secondary"
        block
        icon={<LogOut size={16} aria-hidden="true" />}
        onClick={() => void signOut()}
      >
        {t('auth.logout')}
      </Button>
    </AuthLayout>
  )
}
