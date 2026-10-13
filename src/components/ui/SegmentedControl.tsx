import type { ReactNode } from 'react'
import './SegmentedControl.css'

interface Option<T extends string> {
  value: T
  label: ReactNode
  count?: number
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

/** Pill-style radio group (keyboard: arrows move between options, like native radios). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const checked = option.value === value
        return (
          <label key={option.value} className={`segmented__option${checked ? ' is-checked' : ''}`}>
            <input
              type="radio"
              className="visually-hidden"
              name={label}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className="segmented__count tabular">{option.count}</span>
            )}
          </label>
        )
      })}
    </div>
  )
}
