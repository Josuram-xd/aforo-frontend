import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article'
  padded?: boolean
}

export function Card({
  as: Tag = 'section',
  padded = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={`card${padded ? ' card--padded' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  icon?: ReactNode
  titleId?: string
}

export function CardHeader({ title, description, actions, icon, titleId }: CardHeaderProps) {
  return (
    <header className="card__header">
      {icon && (
        <span className="card__header-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="card__heading">
        <h2 className="card__title" id={titleId}>
          {title}
        </h2>
        {description && <p className="card__description">{description}</p>}
      </div>
      {actions && <div className="card__actions">{actions}</div>}
    </header>
  )
}
