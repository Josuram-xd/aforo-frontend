/** One tutorial step: `target` is a `data-tour` id (omit it for a centered intro card). */
export interface TourStep {
  target?: string
  /** i18n prefix; the step reads `<key>.title` and `<key>.body`. */
  key: string
}

/** Visible element carrying `data-tour="<id>"`, or null (missing or hidden, e.g. mobile). */
export function findTourTarget(id: string): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${id}"]`)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 ? el : null
}

/** Steps whose target is on screen (intro steps always count). */
export function resolveSteps(steps: TourStep[]): TourStep[] {
  return steps.filter((step) => !step.target || findTourTarget(step.target))
}

/** A tour only makes sense if at least one step points at something on screen. */
export const hasTargets = (steps: TourStep[]) => steps.some((step) => step.target)
