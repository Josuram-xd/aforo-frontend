import type { Database, Tables } from '../../types/database'
import { endOfBogotaDay, startOfBogotaDay } from '../../lib/format'
import { MOCK_AUTH_USER } from './mockIdentity'

// In-memory sample database for mock mode (dev server only). Shapes follow the generated
// Supabase types so the UI is exercised with the real contract. A timer adds an event every few
// seconds to show the live behaviour (Realtime is simulated through `subscribeMock`).

type Row<T extends keyof Database['public']['Tables']> = Tables<T>

const MINUTE = 60_000
const now = () => Date.now()
let seed = 7
function random(): number {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
const uuid = (prefix: string, n: number) =>
  `${prefix}0000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export const CLASSROOM_ID = uuid('c', 1)
const COURSE_ID = uuid('d', 1)
const CAMERA_OUT = uuid('a', 1)
const CAMERA_IN = uuid('a', 2)

const iso = (ms: number) => new Date(ms).toISOString()

const STUDENT_NAMES = [
  'Ana Gómez',
  'Carlos Ruiz',
  'Laura Pérez',
  'Mateo Torres',
  'Valentina Rojas',
  'Santiago Herrera',
  'Isabella Castro',
  'Sebastián Morales',
  'Mariana López',
  'Nicolás Vargas',
  'Camila Ortiz',
  'Daniel Jiménez',
]

export const db = {
  classrooms: [] as Row<'classrooms'>[],
  cameras: [] as Row<'cameras'>[],
  students: [] as Row<'students'>[],
  events: [] as Row<'events'>[],
  alerts: [] as Row<'alerts'>[],
  courses: [] as Row<'courses'>[],
  class_sessions: [] as Row<'class_sessions'>[],
  attendance: [] as Row<'attendance'>[],
  profiles: [] as Row<'profiles'>[],
  user_roles: [] as Row<'user_roles'>[],
  audit_log: [] as Row<'audit_log'>[],
}

export const MOCK_ROLE_IDS = { admin: 16, teacher: 17, viewer: 18 } as const

function build() {
  const t0 = now()
  const dayStart = Date.parse(startOfBogotaDay())

  db.classrooms = [
    {
      id: CLASSROOM_ID,
      name: 'Salón del piloto',
      location: 'Bloque B · piso 2',
      max_capacity: 30,
      current_occupancy: 0,
      occupancy_updated_at: iso(t0),
      created_at: '2026-09-20T15:00:00Z',
      updated_at: iso(t0),
    },
  ]
  db.cameras = [
    {
      id: CAMERA_OUT,
      classroom_id: CLASSROOM_ID,
      code: 'camera-outside',
      name: 'Cámara del pasillo',
      position: 'outside',
      status: 'online',
      last_seen_at: iso(t0 - 20_000),
      created_at: '2026-09-20T15:00:00Z',
      updated_at: iso(t0),
    },
    {
      id: CAMERA_IN,
      classroom_id: CLASSROOM_ID,
      code: 'camera-inside',
      name: 'Cámara del salón',
      position: 'inside',
      status: 'offline',
      last_seen_at: iso(t0 - 9 * MINUTE),
      created_at: '2026-09-20T15:00:00Z',
      updated_at: iso(t0),
    },
  ]
  db.courses = [
    {
      id: COURSE_ID,
      code: 'IS-401',
      name: 'Visión por computador',
      academic_period: '2026-2',
      is_active: true,
      created_at: '2026-08-01T15:00:00Z',
      updated_at: '2026-08-01T15:00:00Z',
    },
  ]
  db.students = STUDENT_NAMES.map((name, index) => ({
    id: uuid('b', index + 1),
    full_name: name,
    email: `${name.split(' ')[0]!.toLowerCase()}@universidad.edu.co`,
    student_code: `2026${String(1000 + index * 37)}`,
    is_active: index !== 11,
    presence: 'OUT',
    last_event_at: null,
    created_at: '2026-08-10T15:00:00Z',
    updated_at: '2026-08-10T15:00:00Z',
  }))

  const sessionStart = dayStart + 7 * 60 * MINUTE
  db.class_sessions = [
    {
      id: uuid('e', 1),
      title: 'Clase 9 · Seguimiento de personas',
      course_id: COURSE_ID,
      classroom_id: CLASSROOM_ID,
      starts_at: iso(sessionStart),
      ends_at: iso(sessionStart + 4 * 60 * MINUTE),
      status: 'scheduled',
      created_by: MOCK_AUTH_USER.id,
      created_at: iso(dayStart - 2 * 86400_000),
      updated_at: iso(dayStart - 2 * 86400_000),
    },
    {
      id: uuid('e', 2),
      title: 'Clase 8 · Reconocimiento facial',
      course_id: COURSE_ID,
      classroom_id: CLASSROOM_ID,
      starts_at: iso(sessionStart - 2 * 86400_000),
      ends_at: iso(sessionStart - 2 * 86400_000 + 4 * 60 * MINUTE),
      status: 'scheduled',
      created_by: MOCK_AUTH_USER.id,
      created_at: iso(dayStart - 6 * 86400_000),
      updated_at: iso(dayStart - 6 * 86400_000),
    },
    {
      id: uuid('e', 3),
      title: 'Clase 10 · Demo del piloto',
      course_id: COURSE_ID,
      classroom_id: CLASSROOM_ID,
      starts_at: iso(sessionStart + 2 * 86400_000),
      ends_at: iso(sessionStart + 2 * 86400_000 + 3 * 60 * MINUTE),
      status: 'scheduled',
      created_by: MOCK_AUTH_USER.id,
      created_at: iso(dayStart - 86400_000),
      updated_at: iso(dayStart - 86400_000),
    },
  ]

  // Events from 07:00 Bogotá until now (or a synthetic morning if it's still early).
  db.events = []
  db.attendance = []
  const start = Math.min(sessionStart, t0 - 3 * 60 * MINUTE)
  let cursor = start
  while (cursor < t0 - MINUTE) {
    cursor += (2 + random() * 9) * MINUTE
    if (cursor >= t0) break
    addEvent(cursor)
  }

  db.alerts = [
    {
      id: uuid('f', 1),
      type: 'camera_offline',
      severity: 'warning',
      message: 'La cámara del salón no envía latidos desde hace 9 minutos.',
      classroom_id: CLASSROOM_ID,
      camera_id: CAMERA_IN,
      created_at: iso(t0 - 9 * MINUTE),
      resolved_at: null,
      resolved_by: null,
    },
    {
      id: uuid('f', 2),
      type: 'capacity_exceeded',
      severity: 'critical',
      message: 'El salón superó el aforo máximo (31 de 30).',
      classroom_id: CLASSROOM_ID,
      camera_id: null,
      created_at: iso(t0 - 26 * 60 * MINUTE),
      resolved_at: iso(t0 - 25 * 60 * MINUTE),
      resolved_by: MOCK_AUTH_USER.id,
    },
  ]

  db.profiles = [
    ['Josuram Demo', 'docente.demo@aforo.test', true],
    ['María Fernanda Ríos', 'mfrios@universidad.edu.co', true],
    ['Andrés Salazar', 'asalazar@universidad.edu.co', true],
    ['Paula Méndez', 'paula.mendez@gmail.com', true],
    ['Julián Cárdenas', 'jcardenas@universidad.edu.co', false],
  ].map(([name, email, active], index) => ({
    id: index === 0 ? MOCK_AUTH_USER.id : uuid('9', index + 1),
    full_name: name as string,
    email: email as string,
    avatar_url: null,
    is_active: active as boolean,
    created_at: iso(t0 - (20 - index * 3) * 86400_000),
    updated_at: iso(t0 - 86400_000),
  }))
  const roleByIndex = [
    MOCK_ROLE_IDS.admin,
    MOCK_ROLE_IDS.teacher,
    MOCK_ROLE_IDS.viewer,
    MOCK_ROLE_IDS.viewer,
    MOCK_ROLE_IDS.teacher,
  ]
  db.user_roles = db.profiles.map((profile, index) => ({
    user_id: profile.id,
    role_id: roleByIndex[index]!,
    granted_at: profile.created_at,
    granted_by: MOCK_AUTH_USER.id,
  }))

  const actions = ['LOGIN', 'VIEW', 'UPDATE', 'INSERT', 'LOGOUT', 'EXPORT', 'VIEW', 'LOGIN']
  db.audit_log = Array.from({ length: 34 }, (_, i) => {
    const action = actions[i % actions.length]!
    const actor = db.profiles[i % 4]!
    const isDataChange = action === 'UPDATE' || action === 'INSERT'
    return {
      id: 1000 - i,
      action,
      actor_id: actor.id,
      table_name: isDataChange
        ? i % 2 === 0
          ? 'students'
          : 'classrooms'
        : action === 'VIEW'
          ? 'students'
          : action === 'EXPORT'
            ? 'events'
            : 'password',
      record_id: isDataChange ? CLASSROOM_ID : null,
      old_data: action === 'UPDATE' ? { max_capacity: 28, name: 'Salón del piloto' } : null,
      new_data: isDataChange ? { max_capacity: 30, name: 'Salón del piloto' } : null,
      created_at: iso(t0 - i * 47 * MINUTE),
    }
  })
}

let eventCounter = 0

/** Adds one event keeping occupancy, presence and attendance consistent (like the DB triggers). */
function addEvent(at: number): Row<'events'> {
  const classroom = db.classrooms[0]!
  const inside = db.students.filter((s) => s.presence === 'IN' && s.is_active)
  const outside = db.students.filter((s) => s.presence === 'OUT' && s.is_active)
  const wantsExit = classroom.current_occupancy > 0 && (random() < 0.38 || outside.length === 0)
  const direction = wantsExit ? 'EXIT' : 'ENTRY'
  const pool = direction === 'ENTRY' ? outside : inside
  const identified = random() < 0.74 && pool.length > 0
  const student = identified ? pool[Math.floor(random() * pool.length)]! : null

  const event: Row<'events'> = {
    id: uuid('7', ++eventCounter),
    classroom_id: CLASSROOM_ID,
    direction,
    method: identified ? 'FACE' : 'BODY_ONLY',
    confidence: identified ? 0.82 + random() * 0.16 : 0.55 + random() * 0.2,
    occurred_at: iso(at),
    received_at: iso(at + 400),
    student_id: student?.id ?? null,
    session_id: db.class_sessions[0]?.id ?? null,
    camera_outside_id: CAMERA_OUT,
    camera_inside_id: CAMERA_IN,
  }
  db.events.unshift(event)
  classroom.current_occupancy = Math.max(
    0,
    classroom.current_occupancy + (direction === 'ENTRY' ? 1 : -1),
  )
  classroom.occupancy_updated_at = event.occurred_at

  if (student) {
    student.presence = direction === 'ENTRY' ? 'IN' : 'OUT'
    student.last_event_at = event.occurred_at
    const sessionId = event.session_id!
    const existing = db.attendance.find(
      (row) => row.student_id === student.id && row.session_id === sessionId,
    )
    if (existing) {
      existing.status = direction === 'ENTRY' ? 'present' : 'left'
      existing.last_event_at = event.occurred_at
      if (direction === 'EXIT') existing.last_exit_at = event.occurred_at
      existing.updated_at = event.occurred_at
    } else {
      db.attendance.push({
        session_id: sessionId,
        student_id: student.id,
        status: direction === 'ENTRY' ? 'present' : 'left',
        first_entry_at: direction === 'ENTRY' ? event.occurred_at : null,
        last_exit_at: direction === 'EXIT' ? event.occurred_at : null,
        last_event_at: event.occurred_at,
        updated_at: event.occurred_at,
      })
    }
  }
  return event
}

build()

// ---------- Simulated Realtime ----------

type MockTable = 'events' | 'classrooms' | 'cameras' | 'alerts'
const listeners = new Set<(table: MockTable) => void>()

export function subscribeMock(listener: (table: MockTable) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notifyMock(table: MockTable): void {
  listeners.forEach((listener) => listener(table))
}

const LIVE_EVENT_EVERY_MS = 9_000
setInterval(() => {
  addEvent(now())
  db.cameras[0]!.last_seen_at = iso(now())
  notifyMock('events')
  notifyMock('classrooms')
}, LIVE_EVENT_EVERY_MS)

// ---------- Helpers for the API modules ----------

/** Simulated network latency so skeletons are visible in mock mode. */
export function delay<T>(value: T, ms = 350 + random() * 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))
}

export function todayRange(): { from: string; to: string } {
  return { from: startOfBogotaDay(), to: endOfBogotaDay() }
}

export function newId(prefix = '5'): string {
  return uuid(prefix, Math.floor(random() * 1e11))
}
