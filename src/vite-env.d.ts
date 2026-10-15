/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  /** "true" serves built-in sample data. Only honoured by the dev server (`npm run dev`). */
  readonly VITE_USE_MOCK?: string
  /** Role used in mock mode: admin | teacher | viewer (default admin). */
  readonly VITE_MOCK_ROLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
