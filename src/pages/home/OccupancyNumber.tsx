import { useState } from 'react'

/**
 * The hero occupancy number (96px, §8.2). When the value changes it pulses once, tinted by the
 * direction of the change; prefers-reduced-motion turns the animation off (index.css).
 */
export function OccupancyNumber({ value }: { value: number }) {
  const [previous, setPrevious] = useState(value)
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)

  if (value !== previous) {
    setDirection(value > previous ? 'up' : 'down')
    setPrevious(value)
  }

  return (
    <span
      // A new key remounts the span so the CSS animation replays on every change.
      key={value}
      className={`occupancy-number${direction ? ` occupancy-number--pulse-${direction}` : ''}`}
    >
      {value}
    </span>
  )
}
