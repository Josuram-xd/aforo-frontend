import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Classroom } from '../../api/types'
import { renderWithProviders } from '../../test/render'
import { CameraDialog } from './SettingsDialogs'

const ROOM: Classroom = {
  id: 'room-1',
  name: 'Salón 1',
  location: null,
  max_capacity: 30,
  current_occupancy: 0,
  occupancy_updated_at: null,
  created_at: '2026-10-01T12:00:00Z',
  updated_at: '2026-10-01T12:00:00Z',
}

const api = vi.hoisted(() => ({ create: vi.fn(), rename: vi.fn(), connect: vi.fn() }))

vi.mock('../../api/facilities', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/facilities')>()),
  createCamera: api.create,
  renameCamera: api.rename,
  saveCameraConnection: api.connect,
}))

describe('CameraDialog retry after a failed connection save', () => {
  it('does not create the camera again when the retry reuses it', async () => {
    const user = userEvent.setup()
    api.create.mockResolvedValue({ id: 'cam-1' })
    api.connect.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(undefined)

    renderWithProviders(
      <CameraDialog
        camera={null}
        classrooms={[ROOM]}
        connection={undefined}
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    )
    await user.type(screen.getByLabelText('Nombre visible'), 'Entrada')
    await user.selectOptions(screen.getByLabelText('Salón'), 'room-1')
    await user.type(screen.getByLabelText('Dirección IP de la cámara'), '192.168.1.50')
    await user.type(screen.getByLabelText('Usuario de la cámara'), 'admin')
    await user.type(screen.getByLabelText(/Contraseña de la cámara/), 'secreto')

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(api.connect).toHaveBeenCalledTimes(1))
    // The classroom and position of the created camera can no longer change.
    expect(screen.getByLabelText('Salón')).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(api.connect).toHaveBeenCalledTimes(2))
    expect(api.create).toHaveBeenCalledTimes(1)
    expect(api.connect.mock.calls[1]?.[0]).toBe('cam-1')
  })
})
