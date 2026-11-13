import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { captureAuthLinkType } from '../auth/passwordSetup'
import type { Database } from '../types/database'
import { env, isMockMode, isSupabaseConfigured } from './env'

// Only the publishable key ever reaches the browser; every query runs with the signed-in
// user's JWT and is filtered by RLS in aforo-db. supabase-js owns the session (PKCE flow).
// Invite links must be detected before supabase-js reads (and clears) the URL hash.
captureAuthLinkType(window.location)

// In mock/demo mode no client is created (so no stored session is restored or refreshed) and any
// use of it throws: a code path that forgot its mock branch fails loudly instead of hitting the network.
function blockedClient(): SupabaseClient<Database> {
  return new Proxy({} as SupabaseClient<Database>, {
    get(_target, property) {
      throw new Error(`Supabase is disabled in mock/demo mode (accessed "${String(property)}")`)
    },
  })
}

export const supabase: SupabaseClient<Database> = isMockMode
  ? blockedClient()
  : createClient<Database>(
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
