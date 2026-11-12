import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Camera } from '../../api/types'
import type { RoleCode } from '../../auth/roles'
import { renderWithProviders } from '../../test/render'
import { CamerasPage } from './CamerasPage'

const role = vi.hoisted(() => ({ value: 'admin' as RoleCode }))
const connections = vi.hoisted(() => vi.fn())

const CAMERA: Camera = {
  id: '00000000-0000-4000-8000-0000000000c1',
  classroom_id: 'room-1',
  code: 'CAM-1',
  name: 'Entrada',
  position: 'outside',
  status: 'online',
  last_seen_at: null,
  created_at: '2026-10-01T12:00:00Z',
  updated_at: '2026-10-01T12:00:00Z',
}

vi.mock('../../auth/useRole', () => ({
  useRole: () => ({ role: role.value, isPending: false }),
}))
vi.mock('../../hooks/queries', () => ({
  useCameras: () => ({ data: [CAMERA], isPending: false, isError: false, refetch: vi.fn() }),
  useClassrooms: () => ({ data: [{ id: 'room-1', name: 'Salón 1' }] }),
  useCameraConnections: (enabled?: boolean) => {
    connections(enabled)
    return { data: [{ camera_id: CAMERA.id, host: '192.168.1.50', username: 'u' }] }
  },
}))

describe('CamerasPage connect action', () => {
  beforeEach(() => {
    role.value = 'admin'
    connections.mockClear()
  })

  it('lets admins add cameras and edit the connection, showing the IP', () => {
    renderWithProviders(<CamerasPage />)
    expect(screen.getByRole('button', { name: 'Agregar cámara' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Conectar o editar Entrada' })).toHaveTextContent(
      'Editar conexión',
    )
    expect(screen.getByText('192.168.1.50')).toBeInTheDocument()
    expect(connections).toHaveBeenCalledWith(true)
  })

  it.each<RoleCode>(['teacher', 'viewer'])('shows no connect controls to %s', (r) => {
    role.value = r
    renderWithProviders(<CamerasPage />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText('192.168.1.50')).not.toBeInTheDocument()
    expect(connections).toHaveBeenCalledWith(false)
  })
})
