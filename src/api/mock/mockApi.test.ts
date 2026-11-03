import { afterAll, describe, expect, it, vi } from 'vitest'

// The mock DB adds a live event on a timer; fake timers keep the data still during the test.
vi.useFakeTimers({ toFake: ['setInterval'] })
const { fetchEventsPage } = await import('./mockApi')
const { EVENTS_PAGE_SIZE } = await import('../events')
const { bogotaDay, addDays } = await import('../../lib/format')

afterAll(() => {
  vi.useRealTimers()
})

async function load(filters: Parameters<typeof fetchEventsPage>[0], page = 0) {
  const promise = fetchEventsPage(filters, page)
  return promise
}

describe('events filters on mock data', () => {
  const today = bogotaDay()
  const range = { from: addDays(today, -6), to: today }

  it('returns a page of at most EVENTS_PAGE_SIZE rows, newest first', async () => {
    const result = await load(range)
    expect(result.rows.length).toBeLessThanOrEqual(EVENTS_PAGE_SIZE)
    expect(result.total).toBeGreaterThan(0)
    const times = result.rows.map((row) => row.occurredAt)
    expect([...times].sort().reverse()).toEqual(times)
  })

  it('filters by direction', async () => {
    const result = await load({ ...range, direction: 'EXIT' })
    expect(result.rows.length).toBeGreaterThan(0)
    expect(result.rows.every((row) => row.direction === 'EXIT')).toBe(true)
  })

  it('filters by method and never mixes FACE with BODY_ONLY', async () => {
    const face = await load({ ...range, method: 'FACE' })
    const body = await load({ ...range, method: 'BODY_ONLY' })
    const all = await load(range)
    expect(face.rows.every((row) => row.method === 'FACE' && row.studentName !== null)).toBe(true)
    expect(body.rows.every((row) => row.method === 'BODY_ONLY' && row.studentName === null)).toBe(
      true,
    )
    expect(face.total + body.total).toBe(all.total)
  })

  it('filters by student', async () => {
    const face = await load({ ...range, method: 'FACE' })
    const studentId = face.rows[0]!.studentId!
    const result = await load({ ...range, studentId })
    expect(result.rows.every((row) => row.studentId === studentId)).toBe(true)
  })

  it('returns nothing for a date range without events', async () => {
    const result = await load({ from: '2020-01-01', to: '2020-01-02' })
    expect(result).toEqual({ rows: [], total: 0 })
  })
})
