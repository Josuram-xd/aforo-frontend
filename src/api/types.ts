import type { RoleCode } from '../auth/roles'
import type { Json, Tables } from '../types/database'

// UI-facing shapes built from the generated Supabase types (contract = aforo-db).

export type Direction = 'ENTRY' | 'EXIT'
export type EventMethod = 'FACE' | 'BODY_ONLY'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertType = 'capacity_exceeded' | 'camera_offline'

export type Classroom = Tables<'classrooms'>
export type Camera = Tables<'cameras'>
export type Course = Tables<'courses'>
export type Student = Tables<'students'>
export type DailySummary = Tables<'daily_occupancy_summary'>

export interface Page<T> {
  rows: T[]
  total: number
}

export interface EventItem {
  id: string
  occurredAt: string
  direction: Direction
  method: EventMethod
  confidence: number
  studentId: string | null
  studentName: string | null
  classroomId: string
  sessionId: string | null
}

export interface EventFilters {
  /** Bogotá calendar days, YYYY-MM-DD, inclusive. */
  from?: string
  to?: string
  direction?: Direction | ''
  method?: EventMethod | ''
  studentId?: string
  classroomId?: string
}

export interface AlertItem {
  id: string
  type: AlertType
  severity: AlertSeverity
  message: string
  classroomId: string
  classroomName: string | null
  cameraId: string | null
  cameraName: string | null
  createdAt: string
  resolvedAt: string | null
  resolvedBy: string | null
}

export interface SessionItem extends Tables<'class_sessions'> {
  courseName: string | null
  classroomName: string | null
}

export interface AttendanceItem {
  sessionId: string
  studentId: string
  studentName: string
  studentCode: string | null
  status: 'present' | 'left'
  firstEntryAt: string | null
  lastExitAt: string | null
  lastEventAt: string
}

export interface UserItem {
  id: string
  fullName: string | null
  email: string | null
  avatarUrl: string | null
  isActive: boolean
  createdAt: string
  role: RoleCode | null
}

export interface AuditItem {
  id: number
  action: string
  actorId: string | null
  actorName: string | null
  actorEmail: string | null
  tableName: string | null
  recordId: string | null
  oldData: Json | null
  newData: Json | null
  createdAt: string
}

export interface AuditFilters {
  actorId?: string
  action?: string
  tableName?: string
  from?: string
  to?: string
}
