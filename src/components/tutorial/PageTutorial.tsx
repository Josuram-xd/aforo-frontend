import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { findTourTarget, hasTargets, resolveSteps, type TourStep } from './tourTargets'
import './PageTutorial.css'

const PAD = 6
const MARGIN = 12
const GAP = 12

interface Placement {
  spot: { top: number; left: number; width: number; height: number } | null
  card: { top: number; left: number }
}

/** Info button that opens a step-by-step spotlight tour of the current screen. */
export function PageTutorial({ steps }: { steps: TourStep[] }) {
  const { t } = useTranslation()
  const titleId = useId()
  const bodyId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState(false)
  const [active, setActive] = useState<TourStep[] | null>(null)
  const [index, setIndex] = useState(0)
  const [placement, setPlacement] = useState<Placement | null>(null)

  // Targets can appear late (data loading) or depend on role/viewport: watch the DOM, once per frame.
  useEffect(() => {
    let frame = 0
    const check = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setAvailable(hasTargets(resolveSteps(steps))))
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('resize', check)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [steps])

  const step = active?.[index]

  const close = useCallback(() => {
    setActive(null)
    triggerRef.current?.focus()
  }, [])

  const place = useCallback(() => {
    const card = cardRef.current
    if (!card || !step) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const el = step.target ? findTourTarget(step.target) : null
    if (!el) {
      setPlacement({
        spot: null,
        card: { top: (vh - card.offsetHeight) / 2, left: (vw - card.offsetWidth) / 2 },
      })
      return
    }
    const r = el.getBoundingClientRect()
    const spot = {
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    }
    const below = spot.top + spot.height + GAP
    const above = spot.top - GAP - card.offsetHeight
    // Below if it fits, else above, else pinned to the bottom edge (over a tall target).
    const top =
      below + card.offsetHeight <= vh - MARGIN
        ? below
        : above >= MARGIN
          ? above
          : vh - card.offsetHeight - MARGIN
    const left = Math.max(MARGIN, Math.min(spot.left, vw - card.offsetWidth - MARGIN))
    setPlacement({ spot, card: { top: Math.max(MARGIN, top), left } })
  }, [step])

  // Bring the target into view, then keep the spotlight glued to it while scrolling or resizing.
  useLayoutEffect(() => {
    if (!step) return
    const el = step.target ? findTourTarget(step.target) : null
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView?.({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    place()
    cardRef.current?.focus()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [step, place])

  // Esc closes, arrows navigate, Tab stays inside the card.
  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      } else if (event.key === 'ArrowRight') {
        setIndex((i) => Math.min(i + 1, active.length - 1))
      } else if (event.key === 'ArrowLeft') {
        setIndex((i) => Math.max(i - 1, 0))
      } else if (event.key === 'Tab') {
        const card = cardRef.current
        const items = card ? [...card.querySelectorAll<HTMLElement>('button:not(:disabled)')] : []
        const first = items.at(0)
        const last = items.at(-1)
        if (!card || !first || !last) return
        const current = document.activeElement
        if (!card.contains(current) || current === card) {
          event.preventDefault()
          ;(event.shiftKey ? last : first).focus()
        } else if (event.shiftKey && current === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && current === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, close])

  const open = () => {
    const valid = resolveSteps(steps)
    if (!hasTargets(valid)) return
    setPlacement(null)
    setIndex(0)
    setActive(valid)
  }

  if (!available && !active) return null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="tour-trigger"
        aria-label={t('tutorial.ui.open')}
        title={t('tutorial.ui.open')}
        aria-haspopup="dialog"
        onClick={open}
      >
        <span aria-hidden="true">!</span>
      </button>
      {active &&
        step &&
        createPortal(
          <div className="tour">
            <div className="tour__shield" />
            {placement?.spot ? (
              <div
                className="tour__spot"
                style={{
                  width: placement.spot.width,
                  height: placement.spot.height,
                  transform: `translate(${placement.spot.left}px, ${placement.spot.top}px)`,
                }}
              />
            ) : (
              <div className="tour__dim" />
            )}
            <div
              ref={cardRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={bodyId}
              tabIndex={-1}
              className="tour__card"
              style={{
                transform: placement
                  ? `translate(${placement.card.left}px, ${placement.card.top}px)`
                  : undefined,
                opacity: placement ? 1 : 0,
              }}
            >
              <p className="tour__count">
                {t('tutorial.ui.step', { current: index + 1, total: active.length })}
              </p>
              <h2 className="tour__title" id={titleId}>
                {t(`${step.key}.title`)}
              </h2>
              <p className="tour__body" id={bodyId}>
                {t(`${step.key}.body`)}
              </p>
              <div className="tour__actions">
                <Button variant="ghost" size="md" onClick={close}>
                  {t('tutorial.ui.close')}
                </Button>
                <span className="tour__nav">
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={index === 0}
                    onClick={() => setIndex(index - 1)}
                  >
                    {t('tutorial.ui.prev')}
                  </Button>
                  <Button
                    size="md"
                    disabled={index === active.length - 1}
                    onClick={() => setIndex(index + 1)}
                  >
                    {t('tutorial.ui.next')}
                  </Button>
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
