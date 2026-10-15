import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContext, type ToastApi, type ToastTone } from './toastContext'
import './Toast.css'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

/** Toasts disappear after 4 s (DESIGN_SYSTEM.md §8.6); errors stay a bit longer. */
const DURATION_MS: Record<ToastTone, number> = { success: 4000, info: 4000, error: 6000 }
const MAX_VISIBLE = 4
const ICONS = { success: CircleCheck, error: CircleAlert, info: Info }

function ToastView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const { t } = useTranslation()
  const [paused, setPaused] = useState(false)
  const Icon = ICONS[item.tone]

  useEffect(() => {
    if (paused) return
    const timer = setTimeout(() => onDismiss(item.id), DURATION_MS[item.tone])
    return () => clearTimeout(timer)
  }, [item, onDismiss, paused])

  return (
    <li
      className={`toast toast--${item.tone}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon size={18} aria-hidden="true" className="toast__icon" />
      <p className="toast__message">{item.message}</p>
      <button
        type="button"
        className="toast__close"
        onClick={() => onDismiss(item.id)}
        aria-label={t('common.dismiss')}
      >
        <X size={15} aria-hidden="true" />
      </button>
    </li>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId.current++
    setItems((current) => [...current, { id, tone, message }].slice(-MAX_VISIBLE))
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  const errors = items.filter((item) => item.tone === 'error')
  const others = items.filter((item) => item.tone !== 'error')

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section className="toast-region" aria-label={t('common.notifications')}>
        {/* Errors interrupt; confirmations are announced politely. */}
        <div role="alert">
          <ol className="toast-stack">
            {errors.map((item) => (
              <ToastView key={item.id} item={item} onDismiss={dismiss} />
            ))}
          </ol>
        </div>
        <div role="status">
          <ol className="toast-stack">
            {others.map((item) => (
              <ToastView key={item.id} item={item} onDismiss={dismiss} />
            ))}
          </ol>
        </div>
      </section>
    </ToastContext.Provider>
  )
}
