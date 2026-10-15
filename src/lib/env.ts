// Build-time configuration (Vite injects VITE_* variables).

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

/**
 * Mock mode serves sample data and a fake session so the UI can be built offline.
 * It is restricted to the dev server on purpose: a production build can never skip the login.
 */
export const isMockMode = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

export const isSupabaseConfigured = supabaseUrl !== '' && supabasePublishableKey !== ''

export const env = {
  supabaseUrl,
  supabasePublishableKey,
} as const
