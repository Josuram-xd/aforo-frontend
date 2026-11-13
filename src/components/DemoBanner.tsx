import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { demoActive, exitDemo } from '../lib/demo'
import './DemoBanner.css'

/**
 * Fixed strip shown on every screen while the demo is on. It cannot be closed. It publishes its
 * height as `--demo-offset` so the sticky shell (sidebar, topbar) sits below it.
 */
export function DemoBanner() {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const active = demoActive()

  useLayoutEffect(() => {
    const root = document.documentElement
    const update = () =>
      root.style.setProperty('--demo-offset', `${ref.current?.offsetHeight ?? 0}px`)
    if (!active) return
    update()
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      root.style.removeProperty('--demo-offset')
    }
  }, [active])

  if (!active) return null
  return (
    <div ref={ref} className="demo-banner" role="status">
      <span className="demo-banner__text">{t('demo.banner')}</span>
      <button type="button" className="demo-banner__exit" onClick={exitDemo}>
        {t('demo.exit')}
      </button>
    </div>
  )
}
