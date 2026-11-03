import type { RoleCode } from '../../auth/roles'
import { endOfBogotaDay, formatDateTime, startOfBogotaDay } from '../../lib/format'
import type { TablesInsert } from '../../types/database'
import { AUDIT_PAGE_SIZE } from '../admin'
import { EVENTS_PAGE_SIZE } from '../events'
import type { AlertStatusFilter } from '../alerts'
import type { SessionInput } from '../sessions'
import type { StudentInput } from '../students'
import type {
  AlertItem,
  AlertSeverity,
  AlertType,
  AttendanceItem,
  AuditFilters,
  AuditItem,
  Camera,
  Classroom,
  Course,
  DailySummary,
  Direction,
  EventFilters,
  EventItem,
  EventMethod,
  Page,
  SessionItem,
  Student,
  UserItem,
} from '../types'
import { MOCK_AUTH_USER } from './mockIdentity'
import { db, delay, MOCK_ROLE_IDS, newId, notifyMock } from './mockDb'

// Mock implementations with the same signatures as the real API modules (dev server only).

const studentName = (id: string | null) =>
  id ? (db.students.find((s) => s.id === id)?.full_name ?? null) : null

function toEventItem(row: (typeof db.events)[number]): EventItem {
  return {
    id: row.id,
    occurredAt: row.occurred_at,
    direction: row.direction as Direction,
    method: row.method as EventMethod,
    confidence: row.confidence,
    studentId: row.student_id,
    studentName: studentName(row.student_id),
    classroomId: row.classroom_id,
    sessionId: row.session_id,
  }
}

export const fetchClassrooms = (): Promise<Classroom[]> => delay(db.classrooms)
export const fetchCameras = (): Promise<Camera[]> => delay(db.cameras)
export const fetchCourses = (): Promise<Course[]> => delay(db.courses)
export const fetchStudents = (): Promise<Student[]> =>
  delay([...db.students].sort((a, b) => a.full_name.localeCompare(b.full_name, 'es')))

export async function saveClassroom(
  input: Pick<TablesInsert<'classrooms'>, 'name' | 'location' | 'max_capacity'>,
  id?: string,
): Promise<void> {
  const existing = id ? db.classrooms.find((c) => c.id === id) : undefined
  if (existing) Object.assign(existing, input, { updated_at: new Date().toISOString() })
  else
    db.classrooms.push({
      id: newId('c'),
      name: input.name,
      location: input.location ?? null,
      max_capacity: input.max_capacity,
      current_occupancy: 0,
      occupancy_updated_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  notifyMock('classrooms')
  await delay(null)
}

export async function deleteClassroom(id: string): Promise<void> {
  db.classrooms = db.classrooms.filter((c) => c.id !== id)
  notifyMock('classrooms')
  await delay(null)
}

export async function renameCamera(id: string, name: string): Promise<void> {
  const camera = db.cameras.find((c) => c.id === id)
  if (camera) camera.name = name
  notifyMock('cameras')
  await delay(null)
}

export async function saveCourse(
  input: Pick<TablesInsert<'courses'>, 'code' | 'name' | 'academic_period' | 'is_active'>,
  id?: string,
): Promise<void> {
  const existing = id ? db.courses.find((c) => c.id === id) : undefined
  if (existing) Object.assign(existing, input)
  else
    db.courses.push({
      id: newId('d'),
      code: input.code,
      name: input.name,
      academic_period: input.academic_period ?? null,
      is_active: input.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  await delay(null)
}

export async function deleteCourse(id: string): Promise<void> {
  db.courses = db.courses.filter((c) => c.id !== id)
  await delay(null)
}

function filterEvents(filters: EventFilters) {
  return db.events.filter((e) => {
    if (filters.from && e.occurred_at < startOfBogotaDay(filters.from)) return false
    if (filters.to && e.occurred_at >= endOfBogotaDay(filters.to)) return false
    if (filters.direction && e.direction !== filters.direction) return false
    if (filters.method && e.method !== filters.method) return false
    if (filters.studentId && e.student_id !== filters.studentId) return false
    if (filters.classroomId && e.classroom_id !== filters.classroomId) return false
    return true
  })
}

export function fetchEventsPage(filters: EventFilters, page: number): Promise<Page<EventItem>> {
  const all = filterEvents(filters)
  const start = page * EVENTS_PAGE_SIZE
  return delay({
    rows: all.slice(start, start + EVENTS_PAGE_SIZE).map(toEventItem),
    total: all.length,
  })
}

export function fetchEventsBetween(classroomId: string, from: string, to: string) {
  return delay(
    db.events
      .filter((e) => e.classroom_id === classroomId && e.occurred_at >= from && e.occurred_at < to)
      .reverse()
      .map(toEventItem),
  )
}

export function fetchLatestEvents(classroomId: string, limit: number) {
  return delay(
    db.events
      .filter((e) => e.classroom_id === classroomId)
      .slice(0, limit)
      .map(toEventItem),
  )
}

export function fetchDailySummary(classroomId: string, day: string): Promise<DailySummary | null> {
  const events = db.events.filter(
    (e) =>
      e.classroom_id === classroomId &&
      e.occurred_at >= startOfBogotaDay(day) &&
      e.occurred_at < endOfBogotaDay(day),
  )
  if (events.length === 0) return delay(null)
  const entries = events.filter((e) => e.direction === 'ENTRY').length
  const face = events.filter((e) => e.method === 'FACE').length
  let running = 0
  let peak = 0
  for (const event of [...events].reverse()) {
    running += event.direction === 'ENTRY' ? 1 : -1
    peak = Math.max(peak, running)
  }
  return delay({
    classroom_id: classroomId,
    classroom_name: db.classrooms.find((c) => c.id === classroomId)?.name ?? null,
    day,
    entries,
    exits: events.length - entries,
    face_identified: face,
    face_identified_pct: Math.round((1000 * face) / events.length) / 10,
    peak_occupancy: peak,
    first_event_at: events[events.length - 1]!.occurred_at,
    last_event_at: events[0]!.occurred_at,
  })
}

export async function exportEventsCsv(params: {
  classroomId: string
  from: string
  to: string
}): Promise<string> {
  const rows = filterEvents({ ...params }).reverse()
  const lines = rows.map((e) =>
    [
      studentName(e.student_id) ?? 'Desconocido',
      e.direction,
      e.method,
      e.confidence.toFixed(2),
      formatDateTime(e.occurred_at),
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  )
  return delay(['estudiante,direccion,metodo,confianza,fecha_hora_bogota', ...lines].join('\r\n'))
}

export function fetchAlerts(status: AlertStatusFilter): Promise<AlertItem[]> {
  return delay(
    db.alerts
      .filter((a) =>
        status === 'open' ? !a.resolved_at : status === 'resolved' ? Boolean(a.resolved_at) : true,
      )
      .map((a) => ({
        id: a.id,
        type: a.type as AlertType,
        severity: a.severity as AlertSeverity,
        message: a.message,
        classroomId: a.classroom_id,
        classroomName: db.classrooms.find((c) => c.id === a.classroom_id)?.name ?? null,
        cameraId: a.camera_id,
        cameraName: db.cameras.find((c) => c.id === a.camera_id)?.name ?? null,
        createdAt: a.created_at,
        resolvedAt: a.resolved_at,
        resolvedBy: a.resolved_by,
      })),
  )
}

export async function resolveAlert(alertId: string): Promise<void> {
  const alert = db.alerts.find((a) => a.id === alertId)
  if (alert && !alert.resolved_at) {
    alert.resolved_at = new Date().toISOString()
    alert.resolved_by = MOCK_AUTH_USER.id
  }
  notifyMock('alerts')
  await delay(null)
}

export async function saveStudent(input: StudentInput, id?: string): Promise<void> {
  const existing = id ? db.students.find((s) => s.id === id) : undefined
  if (existing) Object.assign(existing, input)
  else
    db.students.push({
      id: newId('b'),
      full_name: input.full_name,
      email: input.email ?? null,
      student_code: input.student_code ?? null,
      is_active: true,
      presence: 'OUT',
      last_event_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  await delay(null)
}

export async function setStudentActive(id: string, isActive: boolean): Promise<void> {
  const student = db.students.find((s) => s.id === id)
  if (student) student.is_active = isActive
  await delay(null)
}

export function fetchSessions(): Promise<SessionItem[]> {
  return delay(
    [...db.class_sessions]
      .sort((a, b) => b.starts_at.localeCompare(a.starts_at))
      .map((s) => ({
        ...s,
        courseName: db.courses.find((c) => c.id === s.course_id)?.name ?? null,
        classroomName: db.classrooms.find((c) => c.id === s.classroom_id)?.name ?? null,
      })),
  )
}

export async function saveSession(input: SessionInput, id?: string): Promise<void> {
  const existing = id ? db.class_sessions.find((s) => s.id === id) : undefined
  const nowIso = new Date().toISOString()
  if (existing) Object.assign(existing, input, { updated_at: nowIso })
  else
    db.class_sessions.push({
      id: newId('e'),
      title: input.title,
      course_id: input.course_id,
      classroom_id: input.classroom_id,
      starts_at: input.starts_at,
      ends_at: input.ends_at,
      status: input.status ?? 'scheduled',
      created_by: MOCK_AUTH_USER.id,
      created_at: nowIso,
      updated_at: nowIso,
    })
  await delay(null)
}

export function fetchAttendance(sessionId: string): Promise<AttendanceItem[]> {
  return delay(
    db.attendance
      .filter((row) => row.session_id === sessionId)
      .map((row) => {
        const student = db.students.find((s) => s.id === row.student_id)
        return {
          sessionId: row.session_id,
          studentId: row.student_id,
          studentName: student?.full_name ?? '—',
          studentCode: student?.student_code ?? null,
          status: row.status as AttendanceItem['status'],
          firstEntryAt: row.first_entry_at,
          lastExitAt: row.last_exit_at,
          lastEventAt: row.last_event_at,
        }
      })
      .sort((a, b) => a.studentName.localeCompare(b.studentName, 'es')),
  )
}

const ROLE_BY_ID = Object.fromEntries(
  Object.entries(MOCK_ROLE_IDS).map(([code, id]) => [id, code as RoleCode]),
) as Record<number, RoleCode>

export function fetchUsers(): Promise<UserItem[]> {
  return delay(
    db.profiles.map((p) => ({
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      avatarUrl: p.avatar_url,
      isActive: p.is_active,
      createdAt: p.created_at,
      role: ROLE_BY_ID[db.user_roles.find((r) => r.user_id === p.id)?.role_id ?? 0] ?? null,
    })),
  )
}

export async function setUserRole(userId: string, role: RoleCode): Promise<void> {
  const row = db.user_roles.find((r) => r.user_id === userId)
  if (row) row.role_id = MOCK_ROLE_IDS[role]
  await delay(null)
}

export async function setUserActive(userId: string, active: boolean): Promise<void> {
  const profile = db.profiles.find((p) => p.id === userId)
  if (profile) profile.is_active = active
  await delay(null)
}

export async function inviteUser(email: string, role: RoleCode): Promise<void> {
  const id = newId('9')
  const nowIso = new Date().toISOString()
  db.profiles.unshift({
    id,
    email,
    full_name: null,
    avatar_url: null,
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso,
  })
  db.user_roles.push({
    user_id: id,
    role_id: MOCK_ROLE_IDS[role],
    granted_at: nowIso,
    granted_by: MOCK_AUTH_USER.id,
  })
  await delay(null)
}

export function fetchAuditPage(filters: AuditFilters, page: number): Promise<Page<AuditItem>> {
  const rows = db.audit_log.filter((row) => {
    if (filters.actorId && row.actor_id !== filters.actorId) return false
    if (filters.action && row.action !== filters.action) return false
    if (filters.tableName && row.table_name !== filters.tableName) return false
    if (filters.from && row.created_at < startOfBogotaDay(filters.from)) return false
    if (filters.to && row.created_at >= endOfBogotaDay(filters.to)) return false
    return true
  })
  const start = page * AUDIT_PAGE_SIZE
  return delay({
    total: rows.length,
    rows: rows.slice(start, start + AUDIT_PAGE_SIZE).map((row) => {
      const actor = db.profiles.find((p) => p.id === row.actor_id)
      return {
        id: row.id,
        action: row.action,
        actorId: row.actor_id,
        actorName: actor?.full_name ?? null,
        actorEmail: actor?.email ?? null,
        tableName: row.table_name,
        recordId: row.record_id,
        oldData: row.old_data,
        newData: row.new_data,
        createdAt: row.created_at,
      }
    }),
  })
}
