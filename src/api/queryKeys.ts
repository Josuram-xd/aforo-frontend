// Root query keys. Every query starts with one of these so Realtime can invalidate a whole family.
export const queryKeys = {
  classrooms: ['classrooms'] as const,
  cameras: ['cameras'] as const,
  alerts: ['alerts'] as const,
  events: ['events'] as const,
  dailySummary: ['daily-summary'] as const,
  students: ['students'] as const,
  sessions: ['sessions'] as const,
  attendance: ['attendance'] as const,
  courses: ['courses'] as const,
  users: ['users'] as const,
  audit: ['audit'] as const,
  me: ['me'] as const,
}

export type RealtimeTable = 'events' | 'classrooms' | 'cameras' | 'alerts'

/** Tables published to Realtime by aforo-db, and the query families each change affects. */
export const REALTIME_INVALIDATIONS: Record<RealtimeTable, readonly (readonly string[])[]> = {
  // A new event also moves students.presence, attendance and the daily summary (DB triggers).
  events: [queryKeys.events, queryKeys.dailySummary, queryKeys.students, queryKeys.attendance],
  classrooms: [queryKeys.classrooms],
  cameras: [queryKeys.cameras],
  alerts: [queryKeys.alerts],
}
