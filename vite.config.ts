import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Same CSP as customHttp.yml (Amplify), so `npm run preview` catches violations before deploying.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self' https://uezrriyikquncmcgwwzo.supabase.co wss://uezrriyikquncmcgwwzo.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    headers: {
      'Content-Security-Policy': CONTENT_SECURITY_POLICY,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})
