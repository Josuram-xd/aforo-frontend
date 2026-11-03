import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import { fromPostgrest } from './errors'

// Course enrollment (course_students): teacher/admin read and write (RLS).

const mock = () => import('./mock/mockApi')

export async function fetchCourseStudentIds(courseId: string): Promise<string[]> {
  if (isMockMode) return (await mock()).fetchCourseStudentIds(courseId)
  const { data, error } = await supabase
    .from('course_students')
    .select('student_id')
    .eq('course_id', courseId)
  if (error) throw fromPostgrest(error)
  return data.map((row) => row.student_id)
}

/** Enrolled students per course id. */
export async function fetchEnrollmentCounts(): Promise<Record<string, number>> {
  if (isMockMode) return (await mock()).fetchEnrollmentCounts()
  const { data, error } = await supabase.from('course_students').select('course_id')
  if (error) throw fromPostgrest(error)
  const counts: Record<string, number> = {}
  for (const row of data) counts[row.course_id] = (counts[row.course_id] ?? 0) + 1
  return counts
}

export async function setCourseEnrollment(
  courseId: string,
  studentId: string,
  enrolled: boolean,
): Promise<void> {
  if (isMockMode) return (await mock()).setCourseEnrollment(courseId, studentId, enrolled)
  const { error } = enrolled
    ? await supabase.from('course_students').insert({ course_id: courseId, student_id: studentId })
    : await supabase
        .from('course_students')
        .delete()
        .eq('course_id', courseId)
        .eq('student_id', studentId)
  if (error) throw fromPostgrest(error)
}
