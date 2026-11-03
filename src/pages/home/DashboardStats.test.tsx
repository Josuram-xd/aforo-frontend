import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AlertItem, Camera, Classroom, DailySummary, SessionItem } from '../../api/types'
import { renderWithProviders } from '../../test/render'
import { DashboardStats } from './DashboardStats'

const data = vi.hoisted(() => ({
  summary: null as DailySummary | null,
  cameras: [] as Camera[],
  alerts: [] as AlertItem[],
  sessions: [] as SessionItem[],
}))

const ok = <T,>(value: T) => ({ isPending: false, isError: false, data: value })

vi.mock('../../hooks/queries', () => ({
  useDailySummary: () => ok(data.summary),
  useDayEvents: () => ok([]),
  useCameras: () => ok(data.cameras),
  useAlerts: () => ok(data.alerts),
  useSessions: () => ok(data.sessions),
}))

function classroom(current: number, max = 30): Classroom {
  return {
    id: 'room-1',
    name: 'Salón del piloto',
    location: null,
    max_capacity: max,
    current_occupancy: current,
    occupancy_updated_at: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  }
}

describe('DashboardStats', () => {
  beforeEach(() => {
    data.summary = {
      classroom_id: 'room-1',
      classroom_name: 'Salón del piloto',
      day: '2026-10-13',
      entries: 42,
      exits: 24,
      face_identified: 47,
      face_identified_pct: 71.2,
      peak_occupancy: 20,
      first_event_at: '2026-10-13T12:05:00Z',
      last_event_at: '2026-10-13T16:00:00Z',
    }
    data.cameras = []
    data.alerts = []
    data.sessions = []
  })

  it('shows occupancy against capacity with a text level', () => {
    renderWithProviders(<DashboardStats classroom={classroom(18)} day="2026-10-13" isStaff />)
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('/ 30')).toBeInTheDocument()
    expect(screen.getByText('Con espacio')).toBeInTheDocument()
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '18')
  })

  it.each([
    [25, 'Casi lleno'],
    [31, 'Sobre el aforo máximo'],
  ])('labels %i of 30 as "%s"', (current, label) => {
    renderWithProviders(<DashboardStats classroom={classroom(current)} day="2026-10-13" isStaff />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it("shows today's entries, exits and the face identification rate to staff", () => {
    renderWithProviders(<DashboardStats classroom={classroom(18)} day="2026-10-13" isStaff />)
    expect(screen.getByText('Entradas hoy')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('71')).toBeInTheDocument()
    // FACE and BODY_ONLY stay separate: 66 events, 47 by face, 19 body only.
    expect(screen.getByText('47 por rostro')).toBeInTheDocument()
    expect(screen.getByText('19 solo por cuerpo')).toBeInTheDocument()
  })

  it('degrades for viewers: cameras, alerts and sessions instead of event data', () => {
    data.cameras = [
      { id: 'c1', classroom_id: 'room-1', status: 'online' } as Camera,
      { id: 'c2', classroom_id: 'room-1', status: 'offline' } as Camera,
    ]
    data.alerts = [{ id: 'a1' } as AlertItem]
    renderWithProviders(
      <DashboardStats classroom={classroom(10)} day="2026-10-13" isStaff={false} />,
    )
    expect(screen.queryByText('Entradas hoy')).not.toBeInTheDocument()
    expect(screen.getByText('Cámaras en línea')).toBeInTheDocument()
    expect(screen.getByText('/ 2')).toBeInTheDocument()
    expect(screen.getByText('Alertas abiertas')).toBeInTheDocument()
    expect(screen.getByText('Sin sesiones programadas')).toBeInTheDocument()
  })

  it('shows a skeleton until the classroom arrives', () => {
    renderWithProviders(<DashboardStats classroom={undefined} day="2026-10-13" isStaff />)
    expect(screen.getByText('Cargando…').closest('[aria-busy]')).toHaveAttribute(
      'aria-busy',
      'true',
    )
  })
})
