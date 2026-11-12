import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchAuditPage, fetchUsers } from '../api/admin'
import { fetchAlerts, type AlertStatusFilter } from '../api/alerts'
import {
  fetchDailySummary,
  fetchEventsBetween,
  fetchEventsPage,
  fetchLatestEvents,
} from '../api/events'
import {
  fetchCameraConnections,
  fetchCameras,
  fetchClassrooms,
  fetchCourses,
} from '../api/facilities'
import { queryKeys } from '../api/queryKeys'
import { fetchAttendance, fetchSessions } from '../api/sessions'
import { fetchCourseStudentIds, fetchEnrollmentCounts } from '../api/courseStudents'
import { fetchPhotoUrls, fetchStudents } from '../api/students'
import type { AuditFilters, EventFilters } from '../api/types'
import { endOfBogotaDay, startOfBogotaDay } from '../lib/format'
import { useFallbackRefetchInterval } from '../realtime/realtimeContext'

// One hook per server resource. Realtime invalidates the root keys (api/queryKeys.ts); the
// 30 s polling only kicks in while the websocket is down (ADR-006).

export function useClassrooms() {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({ queryKey: queryKeys.classrooms, queryFn: fetchClassrooms, refetchInterval })
}

export function useCameras() {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({ queryKey: queryKeys.cameras, queryFn: fetchCameras, refetchInterval })
}

/** Admin only (the RPC rejects other roles): host and camera account of each connected camera. */
export function useCameraConnections() {
  return useQuery({ queryKey: queryKeys.cameraConnections, queryFn: fetchCameraConnections })
}

export function useCourses() {
  return useQuery({ queryKey: queryKeys.courses, queryFn: fetchCourses })
}

export function useAlerts(status: AlertStatusFilter) {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({
    queryKey: [...queryKeys.alerts, status],
    queryFn: () => fetchAlerts(status),
    refetchInterval,
  })
}

export function useDailySummary(classroomId: string | undefined, day: string, enabled = true) {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({
    queryKey: [...queryKeys.dailySummary, classroomId, day],
    queryFn: () => fetchDailySummary(classroomId!, day),
    enabled: enabled && Boolean(classroomId),
    refetchInterval,
  })
}

export function useDayEvents(classroomId: string | undefined, day: string, enabled = true) {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({
    queryKey: [...queryKeys.events, 'day', classroomId, day],
    queryFn: () => fetchEventsBetween(classroomId!, startOfBogotaDay(day), endOfBogotaDay(day)),
    enabled: enabled && Boolean(classroomId),
    refetchInterval,
  })
}

export function useLatestEvents(classroomId: string | undefined, limit = 10, enabled = true) {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({
    queryKey: [...queryKeys.events, 'latest', classroomId, limit],
    queryFn: () => fetchLatestEvents(classroomId!, limit),
    enabled: enabled && Boolean(classroomId),
    refetchInterval,
  })
}

export function useEventsPage(filters: EventFilters, page: number) {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({
    queryKey: [...queryKeys.events, 'page', filters, page],
    queryFn: () => fetchEventsPage(filters, page),
    placeholderData: keepPreviousData,
    refetchInterval,
  })
}

export function useStudents(enabled = true) {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({
    queryKey: queryKeys.students,
    queryFn: fetchStudents,
    enabled,
    refetchInterval,
  })
}

export function useSessions() {
  return useQuery({ queryKey: queryKeys.sessions, queryFn: fetchSessions })
}

export function useAttendance(sessionId: string | null) {
  const refetchInterval = useFallbackRefetchInterval()
  return useQuery({
    queryKey: [...queryKeys.attendance, sessionId],
    queryFn: () => fetchAttendance(sessionId!),
    enabled: sessionId !== null,
    refetchInterval,
  })
}

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: fetchUsers })
}

export function useAuditPage(filters: AuditFilters, page: number) {
  return useQuery({
    queryKey: [...queryKeys.audit, filters, page],
    queryFn: () => fetchAuditPage(filters, page),
    placeholderData: keepPreviousData,
  })
}

export function useEnrollmentCounts() {
  return useQuery({
    queryKey: [...queryKeys.courseStudents, 'counts'],
    queryFn: fetchEnrollmentCounts,
  })
}

export function useCourseStudentIds(courseId: string) {
  return useQuery({
    queryKey: [...queryKeys.courseStudents, courseId],
    queryFn: () => fetchCourseStudentIds(courseId),
  })
}

/** Signed URLs for the students' optional photos, keyed by storage path. */
export function useStudentPhotoUrls(paths: string[]) {
  const sorted = [...paths].sort()
  return useQuery({
    queryKey: [...queryKeys.studentPhotos, sorted],
    queryFn: () => fetchPhotoUrls(sorted),
    staleTime: 50 * 60_000, // signed URLs last 1 h
    enabled: sorted.length > 0,
  })
}
