import { createBrowserRouter } from 'react-router'
import { RequireRole } from './auth/RequireRole'
import { ADMIN_ROLES, STAFF_ROLES } from './auth/roles'
import type { RouteHandle } from './layouts/AppShell'
import { ShellRoute } from './layouts/ShellRoute'
import { FullPageLoader } from './components/FullPageLoader'
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RequestResetPage } from './pages/auth/RequestResetPage'
import { SignupPage } from './pages/auth/SignupPage'
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage'
import { HomePage } from './pages/home/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

const handle = (titleKey: string): RouteHandle => ({ titleKey })

// Pages other than Inicio are code-split: each route downloads its module on first visit.
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <SignupPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/recuperar', element: <RequestResetPage /> },
  { path: '/recuperar/nueva', element: <UpdatePasswordPage /> },
  {
    element: (
      <RequireRole roles={[]}>
        <ShellRoute />
      </RequireRole>
    ),
    hydrateFallbackElement: <FullPageLoader />,
    children: [
      { index: true, element: <HomePage />, handle: handle('nav.home') },
      {
        path: 'perfil',
        handle: handle('nav.profile'),
        lazy: async () => ({
          Component: (await import('./pages/profile/ProfilePage')).ProfilePage,
        }),
      },
      {
        element: <RequireRole roles={STAFF_ROLES} />,
        children: [
          {
            path: 'eventos',
            handle: handle('nav.events'),
            lazy: async () => ({
              Component: (await import('./pages/events/EventsPage')).EventsPage,
            }),
          },
        ],
      },
      {
        element: <RequireRole roles={ADMIN_ROLES} />,
        children: [],
      },
      { path: '*', element: <NotFoundPage />, handle: handle('notFound.title') },
    ],
  },
])
