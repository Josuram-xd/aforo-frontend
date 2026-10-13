import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'
import { env, isSupabaseConfigured } from './env'

// Only the publishable key ever reaches the browser; every query runs with the signed-in
// user's JWT and is filtered by RLS in aforo-db. supabase-js owns the session (PKCE flow).
// When the env vars are missing (mock mode), a placeholder client is created and never used.
export const supabase = createClient<Database>(
  isSupabaseConfigured ? env.supabaseUrl : 'http://localhost:54321',
  isSupabaseConfigured ? env.supabasePublishableKey : 'missing-publishable-key',
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
