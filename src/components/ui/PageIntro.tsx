import type { ReactNode } from 'react'
import { PageTutorial } from '../tutorial/PageTutorial'
import type { TourStep } from '../tutorial/tourTargets'
import './PageIntro.css'

interface PageIntroProps {
  /** Short sentence under the topbar title explaining the page. */
  description: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
  /** Tutorial steps for this screen; adds the «!» button next to the actions. */
  tour?: TourStep[]
}

export function PageIntro({ description, actions, eyebrow, tour }: PageIntroProps) {
  return (
    <div className="page-intro">
      <div className="page-intro__text">
        {eyebrow && <p className="page-intro__eyebrow">{eyebrow}</p>}
        <p className="page-intro__description">{description}</p>
      </div>
      {(actions || tour) && (
        <div className="page-intro__actions">
          {actions}
          {tour && <PageTutorial steps={tour} />}
        </div>
      )}
    </div>
  )
}
