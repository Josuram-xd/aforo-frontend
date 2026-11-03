import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import type { TablesInsert } from '../types/database'
import { fromPostgrest } from './errors'
import type { AttendanceItem, SessionItem } from './types'

// Class sessions: all roles read, teacher/admin write. Attendance: teacher/admin read (RLS);
// it is filled by DB triggers from the events, never written by the UI.

const mock = () => import('./mock/mockApi')

export type SessionInput = Pick<
  TablesInsert<'class_sessions'>,
  'title' | 'course_id' | 'classroom_id' | 'starts_at' | 'ends_at' | 'status'
>

export async function fetchSessions(): Promise<SessionItem[]> {
  if (isMockMode) return (await mock()).fetchSessions()
  const { data, error } = await supabase
    .from('class_sessions')
    .select('*, courses(name), classrooms(name)')
    .order('starts_at', { ascending: false })
    .limit(200)
  if (error) throw fromPostgrest(error)
  return data.map(({ courses, classrooms, ...row }) => ({
    ...row,
    courseName: courses?.name ?? null,
    classroomName: classrooms?.name ?? null,
  }))
}

export async function saveSession(input: SessionInput, id?: string): Promise<void> {
  if (isMockMode) return (await mock()).saveSession(input, id)
  const { error } = id
    ? await supabase.from('class_sessions').update(input).eq('id', id)
    : await supabase.from('class_sessions').insert(input)
  if (error) throw fromPostgrest(error)
}

export async function fetchAttendance(sessionId: string): Promise<AttendanceItem[]> {
  if (isMockMode) return (await mock()).fetchAttendance(sessionId)
  const { data, error } = await supabase
    .from('attendance')
    .select(
      'session_id, student_id, status, first_entry_at, last_exit_at, last_event_at, students(full_name, student_code)',
    )
    .eq('session_id', sessionId)
  if (error) throw fromPostgrest(error)
  return data
    .map((row) => ({
      sessionId: row.session_id,
      studentId: row.student_id,
      studentName: row.students?.full_name ?? '—',
      studentCode: row.students?.student_code ?? null,
      status: row.status as AttendanceItem['status'],
      firstEntryAt: row.first_entry_at,
      lastExitAt: row.last_exit_at,
      lastEventAt: row.last_event_at,
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName, 'es'))
}
