import type { UserRole } from '@/features/auth/contracts'
import type { ManagedUser } from './contracts'

export function canManageUser(
  actorRole: UserRole,
  target: ManagedUser,
): boolean {
  return actorRole === 'OWNER' || target.role === 'TECHNICIAN'
}

export function creatableRoles(actorRole: UserRole): readonly UserRole[] {
  return actorRole === 'OWNER'
    ? ['OWNER', 'ADMIN', 'TECHNICIAN']
    : ['TECHNICIAN']
}
