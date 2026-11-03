import { endOfBogotaDay, startOfBogotaDay } from '../lib/format'
import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import { AppError, fromFunctionError, fromPostgrest } from './errors'
import type { DailySummary, Direction, EventFilters, EventItem, EventMethod, Page } from './types'

// Events and the daily summary: teacher/admin only (RLS). Viewers get an empty result or an
// error, so the UI must not depend on them for the occupancy number (that comes from classrooms).

const mock = () => import('./mock/mockApi')

const EVENT_COLUMNS =
  'id, occurred_at, direction, method, confidence, student_id, classroom_id, session_id, students(full_name)' as const

interface EventRow {
  id: string
  occurred_at: string
  direction: string
  method: string
  confidence: number
  student_id: string | null
  classroom_id: string
  session_id: string | null
  students: { full_name: string } | null
}

function toEventItem(row: EventRow): EventItem {
  return {
    id: row.id,
    occurredAt: row.occurred_at,
    direction: row.direction as Direction,
    method: row.method as EventMethod,
    confidence: Number(row.confidence),
    studentId: row.student_id,
    studentName: row.students?.full_name ?? null,
    classroomId: row.classroom_id,
    sessionId: row.session_id,
  }
}

export const EVENTS_PAGE_SIZE = 25

export async function fetchEventsPage(
  filters: EventFilters,
  page: number,
): Promise<Page<EventItem>> {
  if (isMockMode) return (await mock()).fetchEventsPage(filters, page)
  const fromRow = page * EVENTS_PAGE_SIZE
  let query = supabase
    .from('events')
    .select(EVENT_COLUMNS, { count: 'exact' })
    .order('occurred_at', { ascending: false })
    .range(fromRow, fromRow + EVENTS_PAGE_SIZE - 1)
  if (filters.from) query = query.gte('occurred_at', startOfBogotaDay(filters.from))
  if (filters.to) query = query.lt('occurred_at', endOfBogotaDay(filters.to))
  if (filters.direction) query = query.eq('direction', filters.direction)
  if (filters.method) query = query.eq('method', filters.method)
  if (filters.studentId) query = query.eq('student_id', filters.studentId)
  if (filters.classroomId) query = query.eq('classroom_id', filters.classroomId)

  const { data, error, count } = await query
  if (error) throw fromPostgrest(error)
  return { rows: (data as EventRow[]).map(toEventItem), total: count ?? 0 }
}

/** Events of one classroom in [from, to), oldest first — for the per-hour chart. */
export async function fetchEventsBetween(
  classroomId: string,
  from: string,
  to: string,
): Promise<EventItem[]> {
  if (isMockMode) return (await mock()).fetchEventsBetween(classroomId, from, to)
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('classroom_id', classroomId)
    .gte('occurred_at', from)
    .lt('occurred_at', to)
    .order('occurred_at', { ascending: true })
    .limit(5000)
  if (error) throw fromPostgrest(error)
  return (data as EventRow[]).map(toEventItem)
}

export async function fetchLatestEvents(classroomId: string, limit = 10): Promise<EventItem[]> {
  if (isMockMode) return (await mock()).fetchLatestEvents(classroomId, limit)
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('classroom_id', classroomId)
    .order('occurred_at', { ascending: false })
    .limit(limit)
  if (error) throw fromPostgrest(error)
  return (data as EventRow[]).map(toEventItem)
}

/** Today's row of daily_occupancy_summary (security_invoker view → empty for viewers). */
export async function fetchDailySummary(
  classroomId: string,
  day: string,
): Promise<DailySummary | null> {
  if (isMockMode) return (await mock()).fetchDailySummary(classroomId, day)
  const { data, error } = await supabase
    .from('daily_occupancy_summary')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('day', day)
    .maybeSingle()
  if (error) throw fromPostgrest(error)
  return data
}

const MAX_EXPORT_DAYS = 31

/**
 * CSV export through the `export-events` Edge Function (aforo-backend). The function checks the
 * role, logs the EXPORT in audit_log and streams the file.
 */
export async function exportEventsCsv(params: {
  classroomId: string
  from: string
  to: string
}): Promise<{ csv: string; filename: string }> {
  const fromIso = startOfBogotaDay(params.from)
  const toIso = endOfBogotaDay(params.to)
  const days = (Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000
  if (days > MAX_EXPORT_DAYS) throw new AppError('events.exportRangeTooLong', 400)
  const filename = `eventos-${params.from}${params.to !== params.from ? `_${params.to}` : ''}.csv`

  if (isMockMode) return { csv: await (await mock()).exportEventsCsv(params), filename }

  const { data, error } = await supabase.functions.invoke<string>('export-events', {
    method: 'POST',
    body: { from: fromIso, to: toIso, classroomId: params.classroomId },
  })
  if (error) throw await fromFunctionError(error)
  return { csv: typeof data === 'string' ? data : '', filename }
}
