import { Eye, EyeOff } from 'lucide-react'
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { useTranslation } from 'react-i18next'
import './Field.css'

interface FieldProps {
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  /** Extra content on the label row (e.g. "¿Olvidaste tu contraseña?"). */
  labelAside?: ReactNode
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
  className?: string
}

/** Label + control + help text + inline error, wired with ids for screen readers (§8.6). */
export function Field({ label, hint, error, labelAside, children, className }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field${error ? ' field--invalid' : ''}${className ? ` ${className}` : ''}`}>
      <div className="field__label-row">
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
        {labelAside}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }

export function TextInput({ className, icon, ...rest }: InputProps) {
  return (
    <span className={`input-wrap${icon ? ' input-wrap--icon' : ''}`}>
      {icon && (
        <span className="input-wrap__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <input className={`input${className ? ` ${className}` : ''}`} {...rest} />
    </span>
  )
}

/** Password input with a show/hide toggle. The value lives only in the form state. */
export function PasswordInput({ className, ...rest }: Omit<InputProps, 'type'>) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <span className="input-wrap input-wrap--toggle">
      <input
        className={`input${className ? ` ${className}` : ''}`}
        type={visible ? 'text' : 'password'}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        {...rest}
      />
      <button
        type="button"
        className="input-wrap__toggle"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        aria-pressed={visible}
      >
        {visible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </span>
  )
}

export function SelectInput({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`input select${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </select>
  )
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`input textarea${className ? ` ${className}` : ''}`} {...rest} />
}
