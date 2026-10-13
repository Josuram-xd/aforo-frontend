import { createBrowserRouter } from 'react-router'
import type { RouteHandle } from './layouts/AppShell'
import { ShellRoute } from './layouts/ShellRoute'
import { HomePage } from './pages/home/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

const handle = (titleKey: string): RouteHandle => ({ titleKey })

export const router = createBrowserRouter([
  {
    element: <ShellRoute />,
    children: [
      { index: true, element: <HomePage />, handle: handle('nav.home') },
      { path: '*', element: <NotFoundPage />, handle: handle('notFound.title') },
    ],
  },
])
