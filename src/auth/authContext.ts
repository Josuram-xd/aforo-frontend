import { createContext, useContext } from 'react'

/** The parts of the Supabase user the UI needs. Tokens never leave supabase-js. */
export interface AuthUser {
  id: string
  email: string | null
  /** From the sign-up form or the Google profile; the `profiles` row is the source of truth. */
  metadataName: string | null
  metadataAvatarUrl: string | null
}

export interface AuthContextValue {
  user: AuthUser | null
  /** True until the stored session (if any) has been restored. */
  loading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useSession(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useSession must be used inside <AuthProvider>')
  return value
}
