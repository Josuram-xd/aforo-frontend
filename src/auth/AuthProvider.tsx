import type { User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { logAccess } from '../api/accessLog'
import { MOCK_AUTH_USER } from '../api/mock/mockIdentity'
import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import { clearMustSetPassword } from './passwordSetup'
import { AuthContext, type AuthContextValue, type AuthUser } from './authContext'

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function toAuthUser(user: User): AuthUser {
  const metadata = user.user_metadata ?? {}
  return {
    id: user.id,
    email: user.email ?? null,
    metadataName: readString(metadata.full_name) ?? readString(metadata.name),
    metadataAvatarUrl: readString(metadata.avatar_url) ?? readString(metadata.picture),
  }
}

/**
 * Exposes the signed-in user. supabase-js restores and refreshes the session (PKCE flow);
 * this provider only mirrors it into React and wipes cached data when the user changes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(isMockMode ? MOCK_AUTH_USER : null)
  const [loading, setLoading] = useState(!isMockMode)
  const currentUserId = useRef<string | null>(null)

  useEffect(() => {
    if (isMockMode) return

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const next = session?.user ? toAuthUser(session.user) : null
      // Never show one user's cached rows to the next one.
      if (currentUserId.current !== (next?.id ?? null)) {
        currentUserId.current = next?.id ?? null
        queryClient.clear()
        setUser(next)
      } else if (event === 'USER_UPDATED') {
        setUser(next)
      }
      setLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [queryClient])

  const signOut = useCallback(async () => {
    if (isMockMode) return
    // Logged before signing out: the RPC needs the still-valid session.
    await logAccess('LOGOUT')
    await supabase.auth.signOut()
    clearMustSetPassword()
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signOut }),
    [user, loading, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
