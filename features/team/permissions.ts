import type { UserRole } from '@/features/auth/contracts'
import type { ManagedUser } from './contracts'

export function canManageUser(
  actor: { id: string; role: UserRole },
  target: ManagedUser,
): boolean {
  if (target.role === 'OWNER') return false
  if (actor.role === 'ADMIN' && actor.id === target.id) return false
  return actor.role === 'OWNER' || target.role === 'TECHNICIAN'
}

export function creatableRoles(actorRole: UserRole): readonly UserRole[] {
  if (actorRole === 'OWNER') return ['ADMIN', 'TECHNICIAN']
  return actorRole === 'ADMIN' ? ['TECHNICIAN'] : []
}
