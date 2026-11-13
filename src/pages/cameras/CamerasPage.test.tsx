import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Camera } from '../../api/types'
import type { RoleCode } from '../../auth/roles'
import { renderWithProviders } from '../../test/render'
import { CamerasPage } from './CamerasPage'

const role = vi.hoisted(() => ({ value: 'admin' as RoleCode }))
const connections = vi.hoisted(() => vi.fn())
const snapshot = vi.hoisted(() => ({ request: vi.fn(), fetch: vi.fn() }))

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
vi.mock('../../api/facilities', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/facilities')>()),
  requestCameraSnapshot: snapshot.request,
  fetchCameraSnapshot: snapshot.fetch,
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
    snapshot.request.mockReset()
    snapshot.fetch.mockReset()
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

describe('CamerasPage local node notice', () => {
  it.each<RoleCode>(['admin', 'viewer'])('shows the notice to %s', (r) => {
    role.value = r
    renderWithProviders(<CamerasPage />)
    expect(screen.getByText('Requiere un computador en la red de las cámaras')).toBeInTheDocument()
    expect(screen.getByText(/computador con aforo-vision encendido/)).toBeInTheDocument()
  })
})

describe('CamerasPage snapshot view', () => {
  beforeEach(() => {
    role.value = 'admin'
    snapshot.request.mockReset()
    snapshot.fetch.mockReset()
  })

  it('shows the "Ver imagen" button to admins only', () => {
    renderWithProviders(<CamerasPage />)
    expect(screen.getByRole('button', { name: 'Ver imagen de Entrada' })).toBeInTheDocument()
  })

  it.each<RoleCode>(['teacher', 'viewer'])(
    'hides the button from %s and never calls the RPC',
    (r) => {
      role.value = r
      renderWithProviders(<CamerasPage />)
      expect(screen.queryByRole('button', { name: /Ver imagen/ })).not.toBeInTheDocument()
      expect(snapshot.request).not.toHaveBeenCalled()
    },
  )

  it('shows the snapshot with its time once the camera answers', async () => {
    snapshot.request.mockResolvedValue('req-1')
    snapshot.fetch.mockResolvedValue({
      status: 'done',
      image: 'AAAA',
      takenAt: '2026-11-12T15:04:05Z',
    })
    renderWithProviders(<CamerasPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Ver imagen de Entrada' }))

    expect(
      await screen.findByRole('img', { name: 'Foto fija de la cámara Entrada' }),
    ).toHaveAttribute('src', 'data:image/jpeg;base64,AAAA')
    expect(screen.getByText('Tomada a las 10:04:05')).toBeInTheDocument()
    expect(snapshot.request).toHaveBeenCalledWith(CAMERA.id)
    expect(snapshot.fetch).toHaveBeenCalledWith('req-1')
  })

  it('shows the error and a retry button when the camera does not answer', async () => {
    snapshot.request.mockResolvedValue('req-2')
    snapshot.fetch.mockResolvedValue({ status: 'failed', image: null, takenAt: null })
    renderWithProviders(<CamerasPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Ver imagen de Entrada' }))

    expect(
      await screen.findByText(
        'La cámara no respondió. Verifica que aforo-vision esté encendido y la cámara conectada.',
      ),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await waitFor(() => expect(snapshot.request).toHaveBeenCalledTimes(2))
  })
})
