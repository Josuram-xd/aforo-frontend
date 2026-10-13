import { createBrowserRouter } from 'react-router'
import type { RouteHandle } from './layouts/AppShell'
import { ShellRoute } from './layouts/ShellRoute'
import { HomePage } from './pages/home/HomePage'
import { AuthCallbackPage } from './pages/auth/AuthCallbackPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { NotFoundPage } from './pages/NotFoundPage'

const handle = (titleKey: string): RouteHandle => ({ titleKey })

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <SignupPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    element: <ShellRoute />,
    children: [
      { index: true, element: <HomePage />, handle: handle('nav.home') },
      { path: '*', element: <NotFoundPage />, handle: handle('notFound.title') },
    ],
  },
])
