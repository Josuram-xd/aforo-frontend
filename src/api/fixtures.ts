import type { AforoEvent, AforoStatus, PersonStatus } from '../types/event'

// Sample data for mock mode (VITE_USE_MOCK=true). Timestamps are relative to "now"
// so the dashboard looks alive. Occupancy and people status are derived from the events.

const MINUTE = 60_000

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * MINUTE).toISOString()
}

const PEOPLE = [
  { personId: 'p-001', name: 'Ana Gómez' },
  { personId: 'p-002', name: 'Carlos Ruiz' },
  { personId: 'p-003', name: 'Laura Pérez' },
  { personId: 'p-004', name: 'Mateo Torres' },
] as const

type EventSeed = Pick<AforoEvent, 'direction' | 'method' | 'confidence'> & {
  person: (typeof PEOPLE)[number] | null
  minutesAgo: number
}

// Oldest first.
const SEEDS: EventSeed[] = [
  { person: PEOPLE[0], direction: 'ENTRY', method: 'FACE', confidence: 0.94, minutesAgo: 40 },
  { person: PEOPLE[1], direction: 'ENTRY', method: 'FACE', confidence: 0.91, minutesAgo: 36 },
  { person: null, direction: 'ENTRY', method: 'BODY_ONLY', confidence: 0.67, minutesAgo: 31 },
  { person: PEOPLE[2], direction: 'ENTRY', method: 'FACE', confidence: 0.88, minutesAgo: 25 },
  { person: PEOPLE[1], direction: 'EXIT', method: 'FACE', confidence: 0.9, minutesAgo: 18 },
  { person: null, direction: 'EXIT', method: 'BODY_ONLY', confidence: 0.62, minutesAgo: 12 },
  { person: PEOPLE[3], direction: 'ENTRY', method: 'FACE', confidence: 0.93, minutesAgo: 5 },
]

function buildEvents(): AforoEvent[] {
  return SEEDS.map((seed, index) => ({
    eventId: `e-${String(index + 1).padStart(3, '0')}`,
    personId: seed.person?.personId ?? null,
    personName: seed.person?.name ?? null,
    direction: seed.direction,
    cameraOutsideId: 'camera-outside',
    cameraInsideId: 'camera-inside',
    confidence: seed.confidence,
    method: seed.method,
    timestamp: minutesAgo(seed.minutesAgo),
  }))
}

export function mockEvents(from?: string, to?: string): AforoEvent[] {
  return buildEvents()
    .filter((e) => (!from || e.timestamp >= from) && (!to || e.timestamp <= to))
    .reverse()
}

export function mockPeople(): PersonStatus[] {
  const events = buildEvents()
  return PEOPLE.map(({ personId, name }) => {
    const last = events.filter((e) => e.personId === personId).at(-1)
    return {
      personId,
      name,
      status: last?.direction === 'ENTRY' ? 'IN' : 'OUT',
      lastEventAt: last?.timestamp ?? minutesAgo(60),
    }
  })
}

export function mockAforo(): AforoStatus {
  const events = buildEvents()
  const currentOccupancy = events.reduce((n, e) => n + (e.direction === 'ENTRY' ? 1 : -1), 0)
  return { currentOccupancy, lastUpdated: events.at(-1)?.timestamp ?? minutesAgo(0) }
}
