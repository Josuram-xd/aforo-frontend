import { expect, it } from 'vitest'
import type { EventItem } from '../api/types'
import { summarizeEvents } from './summarizeEvents'

const ev = (direction: EventItem['direction'], method: EventItem['method'], at: string) =>
  ({ direction, method, occurredAt: at }) as EventItem

it('totals entries, exits, face share and peak', () => {
  const s = summarizeEvents([
    ev('ENTRY', 'FACE', '2026-10-13T12:00:00Z'),
    ev('ENTRY', 'BODY_ONLY', '2026-10-13T12:05:00Z'),
    ev('EXIT', 'FACE', '2026-10-13T13:00:00Z'),
  ])
  expect(s).toMatchObject({ entries: 2, exits: 1, faceIdentified: 2, peak: 2 })
  expect(s.facePct).toBe(66.7)
  expect(s.firstEventAt).toBe('2026-10-13T12:00:00Z')
})

it('is empty without events', () => {
  expect(summarizeEvents([])).toMatchObject({ entries: 0, facePct: null, peak: null })
})
