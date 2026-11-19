import type { Course } from '../../api/types'

/** The course with a session running now, else the first one (courses arrive sorted by name). */
export function defaultCourseId(
  courses: Course[],
  sessions: { course_id: string; starts_at: string; ends_at: string; status: string }[],
  now = new Date().toISOString(),
): string | undefined {
  const live = sessions.find(
    (s) =>
      s.status === 'scheduled' &&
      s.starts_at <= now &&
      now < s.ends_at &&
      courses.some((c) => c.id === s.course_id),
  )
  return live?.course_id ?? courses[0]?.id
}
