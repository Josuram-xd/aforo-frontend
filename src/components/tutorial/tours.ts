import type { TourStep } from './tourTargets'

const tour = (page: string, ...ids: string[]): TourStep[] => [
  { key: `tutorial.${page}.intro` },
  ...ids.map((id) => ({ target: `${page}-${id}`, key: `tutorial.${page}.${id}` })),
]

/** Steps per screen. A step is skipped when its `data-tour` element is not on screen. */
export const TOURS = {
  home: tour('home', 'room', 'stats', 'chart', 'events', 'cameras', 'alerts'),
  events: tour('events', 'export', 'filters', 'table'),
  students: tour('students', 'create', 'filters', 'table', 'actions'),
  sessions: tour('sessions', 'create', 'list', 'attendance'),
  courses: tour('courses', 'create', 'table', 'actions'),
  cameras: tour('cameras', 'summary', 'add', 'grid', 'note'),
  alerts: tour('alerts', 'filter', 'list', 'resolve'),
  profile: tour('profile', 'card', 'name', 'permissions', 'password'),
  users: tour('users', 'invite', 'filters', 'table', 'actions'),
  audit: tour('audit', 'filters', 'table'),
  settings: tour('settings', 'classrooms', 'classroomAdd', 'cameras', 'cameraAdd'),
} satisfies Record<string, TourStep[]>
