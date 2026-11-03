import type { AuthUser } from '../../auth/authContext'
import { isRoleCode, type RoleCode } from '../../auth/roles'

// Fake identity for mock mode (dev server only, see lib/env.ts).

const envRole = import.meta.env.VITE_MOCK_ROLE
export const MOCK_ROLE: RoleCode = isRoleCode(envRole) ? envRole : 'admin'

export const MOCK_AUTH_USER: AuthUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'docente.demo@aforo.test',
  metadataName: 'Josuram Demo',
  metadataAvatarUrl: null,
}
