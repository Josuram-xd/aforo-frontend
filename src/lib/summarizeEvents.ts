import type { EventItem } from '../api/types'

export interface EventsSummary {
  entries: number
  exits: number
  faceIdentified: number
  facePct: number | null
  peak: number | null
  firstEventAt: string | null
}

/**
 * Daily totals computed from events (oldest first). The `daily_occupancy_summary` view is per
 * classroom, so a course-filtered home derives the same numbers from its own events.
 */
export function summarizeEvents(events: EventItem[]): EventsSummary {
  let entries = 0
  let faceIdentified = 0
  let running = 0
  let peak = 0
  for (const event of events) {
    if (event.direction === 'ENTRY') entries += 1
    if (event.method === 'FACE') faceIdentified += 1
    running += event.direction === 'ENTRY' ? 1 : -1
    peak = Math.max(peak, running)
  }
  const total = events.length
  return {
    entries,
    exits: total - entries,
    faceIdentified,
    facePct: total ? Math.round((1000 * faceIdentified) / total) / 10 : null,
    peak: total ? peak : null,
    firstEventAt: events[0]?.occurredAt ?? null,
  }
}
