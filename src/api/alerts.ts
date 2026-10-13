import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import { fromPostgrest } from './errors'
import type { AlertItem, AlertSeverity, AlertType } from './types'

// Alerts: every active role reads; teacher/admin resolve. `resolved_by` is stamped by a DB
// trigger from the signed-in user, and resolved alerts can no longer be edited.

const mock = () => import('./mock/mockApi')

export type AlertStatusFilter = 'open' | 'resolved' | 'all'

export async function fetchAlerts(status: AlertStatusFilter): Promise<AlertItem[]> {
  if (isMockMode) return (await mock()).fetchAlerts(status)
  let query = supabase
    .from('alerts')
    .select(
      'id, type, severity, message, classroom_id, camera_id, created_at, resolved_at, resolved_by, classrooms(name), cameras(name)',
    )
    .order('created_at', { ascending: false })
    .limit(200)
  if (status === 'open') query = query.is('resolved_at', null)
  if (status === 'resolved') query = query.not('resolved_at', 'is', null)

  const { data, error } = await query
  if (error) throw fromPostgrest(error)
  return data.map((row) => ({
    id: row.id,
    type: row.type as AlertType,
    severity: row.severity as AlertSeverity,
    message: row.message,
    classroomId: row.classroom_id,
    classroomName: row.classrooms?.name ?? null,
    cameraId: row.camera_id,
    cameraName: row.cameras?.name ?? null,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
  }))
}

export async function resolveAlert(alertId: string): Promise<void> {
  if (isMockMode) return (await mock()).resolveAlert(alertId)
  const { error } = await supabase
    .from('alerts')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', alertId)
    .is('resolved_at', null)
  if (error) throw fromPostgrest(error)
}
