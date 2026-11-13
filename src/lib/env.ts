// Build-time configuration (Vite injects VITE_* variables).
import { demoActive } from './demo'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

/**
 * Mock mode serves sample data and a fake session. It is on for the dev server with
 * VITE_USE_MOCK, or in any build after visiting /demo (a per-tab flag, see lib/demo.ts).
 * Neither gives real access: no Supabase session exists and no request leaves the browser.
 */
export const isMockMode =
  (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') || demoActive()

export const isSupabaseConfigured = supabaseUrl !== '' && supabasePublishableKey !== ''

export const env = {
  supabaseUrl,
  supabasePublishableKey,
} as const
