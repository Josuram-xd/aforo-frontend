import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import './Dialog.css'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Icon shown next to the title (e.g. a warning for destructive confirmations). */
  icon?: ReactNode
  tone?: 'default' | 'danger'
}

/**
 * Modal built on the native <dialog>: the browser traps focus, makes the page inert and closes
 * with Escape; focus returns to the trigger on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  icon,
  tone = 'default',
}: DialogProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      const opener = document.activeElement as HTMLElement | null
      dialog.showModal()
      return () => {
        if (dialog.open) dialog.close()
        opener?.focus?.()
      }
    }
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={ref}
      className={`dialog dialog--${size} dialog--${tone}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        // Click on the backdrop (the dialog element itself, outside the panel) closes it.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog__panel">
        <header className="dialog__header">
          {icon && (
            <span className="dialog__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <div className="dialog__heading">
            <h2 className="dialog__title" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="dialog__description" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="icon-button dialog__close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children && <div className="dialog__body">{children}</div>}
        {footer && <footer className="dialog__footer">{footer}</footer>}
      </div>
    </dialog>
  )
}
