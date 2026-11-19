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

describe('reports on mock data', () => {
  it('searches the TEST roster by name prefix, sorted', async () => {
    const { getCourseRoster } = await import('./mockApi')
    const { db } = await import('./mockDb')
    const test = db.courses.find((c) => c.code === 'TEST')!
    const all = await getCourseRoster(test.id, '')
    const names = all.students.map((s) => s.fullName)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'es')))
    expect(names).toEqual(expect.arrayContaining(['Joseph Herrera', 'Juan Cuaran']))
    const hit = await getCourseRoster(test.id, 'jua')
    expect(hit.students.map((s) => s.fullName)).toEqual(['Juan Cuaran'])
  })

  it('builds the session report and pages the timeline both ways', async () => {
    const { getSessionReport } = await import('./mockApi')
    const { db } = await import('./mockDb')
    const session = [...db.class_sessions]
      .filter((s) => db.events.filter((e) => e.session_id === s.id).length > 12)
      .at(0)!
    const first = await getSessionReport(session.id)
    expect(first.timeline.items.length).toBe(10)
    expect(first.timeline.nextCursor).toBeNull()
    const older = await getSessionReport(session.id, {
      cursor: first.timeline.prevCursor!,
      dir: 'prev',
    })
    expect(older.timeline.nextCursor).not.toBeNull()
    const back = await getSessionReport(session.id, {
      cursor: older.timeline.nextCursor!,
      dir: 'next',
    })
    expect(back.timeline.items[0]!.id).toBe(first.timeline.items[0]!.id)
  })

  it('keeps events outside session windows without a session', async () => {
    const { db } = await import('./mockDb')
    for (const e of db.events) {
      if (!e.session_id) continue
      const s = db.class_sessions.find((x) => x.id === e.session_id)!
      expect(e.occurred_at >= s.starts_at && e.occurred_at < s.ends_at).toBe(true)
    }
  })
})
