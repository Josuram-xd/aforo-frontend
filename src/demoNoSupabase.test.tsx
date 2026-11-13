import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { afterAll, describe, expect, it, vi } from 'vitest'

// Any access to the supabase client is recorded (and throws, like the real blocked client).
const accessed = vi.hoisted(() => [] as string[])
vi.mock('./lib/supabase', () => ({
  supabase: new Proxy(
    {},
    {
      get(_target, property) {
        accessed.push(String(property))
        throw new Error('supabase must not be used in demo mode')
      },
    },
  ),
}))
vi.mock('./lib/demo', () => ({
  demoActive: () => true,
  demoRole: () => 'admin',
  exitDemo: vi.fn(),
  activateDemo: vi.fn(),
  parseDemoRole: () => 'admin',
}))

// The mock DB adds a live event on a timer; keep it still.
vi.useFakeTimers({ toFake: ['setInterval'] })
const { AuthProvider } = await import('./auth/AuthProvider')
const { ToastProvider } = await import('./components/ui/Toast')
const { routes } = await import('./router')

afterAll(() => {
  vi.useRealTimers()
})

const PATHS = [
  '/',
  '/camaras',
  '/alertas',
  '/eventos',
  '/estudiantes',
  '/cursos',
  '/sesiones',
  '/perfil',
  '/admin/usuarios',
  '/admin/auditoria',
  '/admin/configuracion',
]

describe('demo mode never touches supabase', () => {
  it.each(PATHS)(
    'renders %s with sample data and no supabase access',
    async (path) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      const router = createMemoryRouter(routes, { initialEntries: [path] })
      render(
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>,
      )
      // Banner + page title prove the shell rendered behind the fake admin session.
      expect(
        await screen.findByText(/MODO DEMOSTRACIÓN/, {}, { timeout: 5000 }),
      ).toBeInTheDocument()
      await screen.findByRole('heading', { level: 1 }, { timeout: 5000 })
      await waitFor(() => expect(queryClient.isFetching()).toBe(0), { timeout: 8000 })
      expect(accessed).toEqual([])
    },
    15000,
  )
})
