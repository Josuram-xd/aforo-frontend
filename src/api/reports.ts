import { isMockMode } from '../lib/env'
import { backendJson } from './backend'
import type { Direction, EventMethod } from './types'

const mock = () => import('./mock/mockApi')

// Reports computed by the Python backend with its own data structures (queue, stacks,
// doubly linked list, binary search tree). Teacher/admin/viewer; the backend applies RLS.

export interface SessionReport {
  session: {
    id: string
    title: string
    startsAt: string
    endsAt: string
    courseId: string
    classroomId: string
  }
  /** Queue: FIFO by first entry. */
  arrivalOrder: { studentId: string; fullName: string; firstEntryAt: string }[]
  /** Per-student stack: non-empty means the student is inside. */
  insideNow: { studentId: string; fullName: string; since: string }[]
  /** Stack underflow (exit without entry) or leftover (entry without exit). */
  anomalies: {
    studentId: string
    fullName: string
    kind: 'EXIT_WITHOUT_ENTRY' | 'ENTRY_WITHOUT_EXIT'
    at: string
  }[]
  /** Global stack of entries, top 5 (LIFO). */
  lastEntries: { studentId: string; fullName: string; at: string }[]
  peak: { count: number; at: string | null }
  /** Doubly linked list window; cursors are event ids. */
  timeline: {
    items: TimelineItem[]
    prevCursor: string | null
    nextCursor: string | null
  }
}

export interface TimelineItem {
  id: string
  direction: Direction
  method: EventMethod
  studentId: string | null
  /** Null for unknown students. */
  fullName: string | null
  occurredAt: string
}

export interface RosterStudent {
  id: string
  fullName: string
  studentCode: string | null
  presence: 'IN' | 'OUT'
  enrollmentStatus: string
}

export interface CourseRoster {
  courseId: string
  structure: 'binary_search_tree'
  height: number
  size: number
  students: RosterStudent[]
}

export interface TimelineCursor {
  cursor?: string
  dir?: 'next' | 'prev'
}

export const TIMELINE_LIMIT = 10

export async function getSessionReport(
  sessionId: string,
  { cursor, dir }: TimelineCursor = {},
): Promise<SessionReport> {
  if (isMockMode) return (await mock()).getSessionReport(sessionId, { cursor, dir })
  return backendJson<SessionReport>(`/sessions/${sessionId}/report`, {
    query: { cursor, dir: cursor ? dir : undefined, limit: TIMELINE_LIMIT },
  })
}

/** Students of a course sorted by name; `q` is a name prefix (BST range search). */
export async function getCourseRoster(courseId: string, q = ''): Promise<CourseRoster> {
  if (isMockMode) return (await mock()).getCourseRoster(courseId, q)
  return backendJson<CourseRoster>(`/courses/${courseId}/roster`, {
    query: { q: q.trim() || undefined },
  })
}
