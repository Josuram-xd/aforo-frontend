import { Outlet } from 'react-router'
import { DemoBanner } from '../components/DemoBanner'

/** Wraps every route so the demo strip shows on any screen, including the login ones. */
export function RootLayout() {
  return (
    <>
      <DemoBanner />
      <Outlet />
    </>
  )
}
