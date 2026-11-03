import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Student } from '../../api/types'
import type { RoleCode } from '../../auth/roles'
import { renderWithProviders } from '../../test/render'
import { StudentsPage } from './StudentsPage'

const role = vi.hoisted(() => ({ value: 'admin' as RoleCode }))

const STUDENT: Student = {
  id: '00000000-0000-4000-8000-0000000000b1',
  full_name: 'Ana María Peña',
  student_code: 'COD-1',
  email: null,
  is_active: true,
  photo_path: null,
  enrollment_status: 'none',
  enrollment_updated_at: null,
  presence: 'OUT',
  last_event_at: null,
  created_at: '2026-10-01T12:00:00Z',
  updated_at: '2026-10-01T12:00:00Z',
}

vi.mock('../../auth/useRole', () => ({
  useRole: () => ({ role: role.value, isPending: false }),
}))
vi.mock('../../api/accessLog', () => ({ useLogView: () => undefined }))
vi.mock('../../hooks/queries', () => ({
  useStudents: () => ({ data: [STUDENT], isPending: false, isError: false, refetch: vi.fn() }),
  useStudentPhotoUrls: () => ({ data: {} }),
}))

describe('StudentsPage delete action', () => {
  beforeEach(() => {
    role.value = 'admin'
  })

  it('shows "Eliminar" to admins', () => {
    renderWithProviders(<StudentsPage />)
    expect(screen.getByRole('button', { name: 'Eliminar a Ana María Peña' })).toBeInTheDocument()
  })

  it('lets teachers delete and enroll students too', () => {
    role.value = 'teacher'
    renderWithProviders(<StudentsPage />)
    expect(screen.getByRole('button', { name: 'Eliminar a Ana María Peña' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Registrar rostro de Ana María Peña' }),
    ).toBeInTheDocument()
  })
})
