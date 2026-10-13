import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
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

function page(path: string, titleKey: string, load: () => Promise<ComponentType>): RouteObject {
  return { path, handle: handle(titleKey), lazy: async () => ({ Component: await load() }) }
}

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
      page(
        'perfil',
        'nav.profile',
        async () => (await import('./pages/profile/ProfilePage')).ProfilePage,
      ),
      page(
        'camaras',
        'nav.cameras',
        async () => (await import('./pages/cameras/CamerasPage')).CamerasPage,
      ),
      page(
        'alertas',
        'nav.alerts',
        async () => (await import('./pages/alerts/AlertsPage')).AlertsPage,
      ),
      {
        element: <RequireRole roles={STAFF_ROLES} />,
        children: [
          page(
            'eventos',
            'nav.events',
            async () => (await import('./pages/events/EventsPage')).EventsPage,
          ),
          page(
            'estudiantes',
            'nav.students',
            async () => (await import('./pages/students/StudentsPage')).StudentsPage,
          ),
          page(
            'sesiones',
            'nav.sessions',
            async () => (await import('./pages/sessions/SessionsPage')).SessionsPage,
          ),
        ],
      },
      {
        element: <RequireRole roles={ADMIN_ROLES} />,
        children: [
          page(
            'admin/usuarios',
            'nav.admin.users',
            async () => (await import('./pages/admin/UsersPage')).UsersPage,
          ),
          page(
            'admin/auditoria',
            'nav.admin.audit',
            async () => (await import('./pages/admin/AuditPage')).AuditPage,
          ),
          page(
            'admin/configuracion',
            'nav.admin.settings',
            async () => (await import('./pages/admin/SettingsPage')).SettingsPage,
          ),
        ],
      },
      { path: '*', element: <NotFoundPage />, handle: handle('notFound.title') },
    ],
  },
])
