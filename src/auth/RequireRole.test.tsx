import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Me } from '../api/me'
import { renderWithProviders } from '../test/render'
import type { AuthContextValue } from './authContext'
import { RequireRole } from './RequireRole'
import { STAFF_ROLES } from './roles'

const session = vi.hoisted(() => ({ value: null as unknown as AuthContextValue }))
const me = vi.hoisted(() => ({
  value: { isPending: false, isError: false, data: undefined as Me | undefined },
}))

vi.mock('./authContext', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./authContext')>()),
  useSession: () => session.value,
}))
vi.mock('./useRole', () => ({
  useMe: () => ({ ...me.value, refetch: vi.fn(), isFetching: false }),
}))

const USER = { id: 'u-1', email: 'ana@test.co', metadataName: 'Ana', metadataAvatarUrl: null }

function profile(overrides: Partial<Me>): Me {
  return {
    id: 'u-1',
    fullName: 'Ana',
    email: 'ana@test.co',
    avatarUrl: null,
    isActive: true,
    createdAt: null,
    role: 'teacher',
    ...overrides,
  }
}

function renderGuard(roles = STAFF_ROLES) {
  return renderWithProviders(
    <RequireRole roles={roles}>
      <p>Contenido protegido</p>
    </RequireRole>,
    { route: '/estudiantes' },
  )
}

describe('RequireRole', () => {
  beforeEach(() => {
    session.value = { user: USER, loading: false, signOut: vi.fn() }
    me.value = { isPending: false, isError: false, data: profile({}) }
  })

  it('shows the loader while the session is being restored', () => {
    session.value = { user: null, loading: true, signOut: vi.fn() }
    renderGuard()
    expect(screen.getByText('Cargando…').closest('[aria-busy]')).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('sends visitors without a session to /login', () => {
    session.value = { user: null, loading: false, signOut: vi.fn() }
    renderGuard()
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
  })

  it('renders the page for an allowed role', () => {
    renderGuard()
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('shows "No tienes permiso" to a viewer on a staff page', () => {
    me.value = { isPending: false, isError: false, data: profile({ role: 'viewer' }) }
    renderGuard()
    expect(screen.getByText('No tienes permiso para ver esta página')).toBeInTheDocument()
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('lets any active role in when no roles are required', () => {
    me.value = { isPending: false, isError: false, data: profile({ role: 'viewer' }) }
    renderGuard([])
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('blocks deactivated accounts even if they have a role', () => {
    me.value = {
      isPending: false,
      isError: false,
      data: profile({ role: 'admin', isActive: false }),
    }
    renderGuard([])
    expect(screen.getByText('Tu cuenta está desactivada')).toBeInTheDocument()
  })

  it('sends invited users to set a password first', () => {
    sessionStorage.setItem('aforo.must-set-password', '1')
    renderGuard()
    expect(screen.getByText('Pantalla de contraseña')).toBeInTheDocument()
  })
})
