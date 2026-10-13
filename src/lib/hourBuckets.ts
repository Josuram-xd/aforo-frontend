import type { EventItem } from '../api/types'
import { bogotaHour } from './format'

export interface HourBucket {
  hour: number
  label: string
  entries: number
  exits: number
}

const DEFAULT_FIRST_HOUR = 6
const DEFAULT_LAST_HOUR = 20

/** Groups events by Bogotá hour; the window always covers 06:00–20:00 plus any outliers. */
export function bucketByHour(events: EventItem[]): HourBucket[] {
  const counts = new Map<number, { entries: number; exits: number }>()
  for (const event of events) {
    const hour = bogotaHour(event.occurredAt)
    const bucket = counts.get(hour) ?? { entries: 0, exits: 0 }
    if (event.direction === 'ENTRY') bucket.entries += 1
    else bucket.exits += 1
    counts.set(hour, bucket)
  }
  const hours = [...counts.keys()]
  const first = Math.min(DEFAULT_FIRST_HOUR, ...hours)
  const last = Math.max(DEFAULT_LAST_HOUR, ...hours)
  return Array.from({ length: last - first + 1 }, (_, index) => {
    const hour = first + index
    const bucket = counts.get(hour) ?? { entries: 0, exits: 0 }
    return { hour, label: `${String(hour).padStart(2, '0')}:00`, ...bucket }
  })
}
