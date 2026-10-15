import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  block?: boolean
}

interface ButtonProps extends CommonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

function classNames(variant: ButtonVariant, size: ButtonSize, block: boolean, extra?: string) {
  return ['btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', extra ?? '']
    .filter(Boolean)
    .join(' ')
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  block = false,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(variant, size, block, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : icon}
      {children}
    </button>
  )
}

type ButtonLinkProps = CommonProps & LinkProps

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  icon,
  block = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classNames(variant, size, block, className)} {...rest}>
      {icon}
      {children}
    </Link>
  )
}
