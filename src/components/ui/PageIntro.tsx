import type { ReactNode } from 'react'
import './PageIntro.css'

interface PageIntroProps {
  /** Short sentence under the topbar title explaining the page. */
  description: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
}

export function PageIntro({ description, actions, eyebrow }: PageIntroProps) {
  return (
    <div className="page-intro">
      <div className="page-intro__text">
        {eyebrow && <p className="page-intro__eyebrow">{eyebrow}</p>}
        <p className="page-intro__description">{description}</p>
      </div>
      {actions && <div className="page-intro__actions">{actions}</div>}
    </div>
  )
}
