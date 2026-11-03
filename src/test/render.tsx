import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ToastProvider } from '../components/ui/Toast'

/** Renders UI with the providers pages expect (query cache, toasts, router). */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '*' }: { route?: string; path?: string } = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={ui} />
            <Route path="/login" element={<p>Pantalla de login</p>} />
            <Route path="/recuperar/nueva" element={<p>Pantalla de contraseña</p>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}
