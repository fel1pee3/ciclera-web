import type { UserRole } from '@/features/auth/contracts'
import type { ManagedUser } from './contracts'

export function canManageUser(
  actorRole: UserRole,
  target: ManagedUser,
  actorUserId?: string,
): boolean {
  if (actorRole === 'OWNER' && actorUserId === target.id) return false
  return actorRole === 'OWNER' || target.role === 'TECHNICIAN'
}

export function creatableRoles(actorRole: UserRole): readonly UserRole[] {
  return actorRole === 'OWNER'
    ? ['OWNER', 'ADMIN', 'TECHNICIAN']
    : ['TECHNICIAN']
}
