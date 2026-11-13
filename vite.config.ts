import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Same CSP as customHttp.yml (Amplify), so `npm run preview` catches violations before deploying.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://uezrriyikquncmcgwwzo.supabase.co",
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
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
    // userEvent tests take ~1 s alone but brush the 5 s default when every worker competes for CPU on Windows.
    testTimeout: 15_000,
  },
  preview: {
    headers: {
      'Content-Security-Policy': CONTENT_SECURITY_POLICY,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()',
    },
  },
})
