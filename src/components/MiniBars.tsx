import './MiniBars.css'

interface MiniBarsProps {
  values: number[]
  /** CSS color of the bars (a token, e.g. var(--color-success)). */
  color: string
}

/** Tiny decorative trend (the exact numbers are in the card and the chart). */
export function MiniBars({ values, color }: MiniBarsProps) {
  const max = Math.max(1, ...values)
  return (
    <span className="mini-bars" aria-hidden="true" style={{ color }}>
      {values.map((value, index) => (
        <span
          key={index}
          className="mini-bars__bar"
          style={{
            height: `${Math.max(6, (value / max) * 100)}%`,
            opacity: value === 0 ? 0.25 : 1,
          }}
        />
      ))}
    </span>
  )
}

interface SplitBarProps {
  first: number
  second: number
  firstLabel: string
  secondLabel: string
}

/** Two-part bar (face vs body-only) with visible text labels. */
export function SplitBar({ first, second, firstLabel, secondLabel }: SplitBarProps) {
  const total = first + second
  const firstPct = total > 0 ? (first / total) * 100 : 0
  return (
    <span className="split-bar">
      <span className="split-bar__track" aria-hidden="true">
        <span className="split-bar__first" style={{ width: `${firstPct}%` }} />
        <span className="split-bar__second" style={{ width: `${100 - firstPct}%` }} />
      </span>
      <span className="split-bar__legend">
        <span>
          <span className="split-bar__dot split-bar__dot--first" aria-hidden="true" />
          {firstLabel}
        </span>
        <span>
          <span className="split-bar__dot split-bar__dot--second" aria-hidden="true" />
          {secondLabel}
        </span>
      </span>
    </span>
  )
}
