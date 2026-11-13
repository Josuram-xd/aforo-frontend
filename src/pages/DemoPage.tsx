import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { FullPageLoader } from '../components/FullPageLoader'
import { activateDemo, parseDemoRole } from '../lib/demo'

/** Public entry of the demo: saves the flag and reloads at Inicio with sample data. */
export function DemoPage() {
  const [params] = useSearchParams()
  const role = parseDemoRole(params.get('rol'))
  useEffect(() => activateDemo(role), [role])
  return <FullPageLoader />
}
