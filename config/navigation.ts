import { Building2, Home, Users, Wrench, type LucideIcon } from 'lucide-react'

import type { UserRole } from '@/features/auth/contracts'

export interface NavigationItem {
  href: string
  icon: LucideIcon
  label: string
}

export const officeNavigation: readonly NavigationItem[] = [
  { href: '/app', icon: Home, label: 'Início' },
  { href: '/app/clientes', icon: Building2, label: 'Clientes' },
  { href: '/app/equipamentos', icon: Wrench, label: 'Equipamentos' },
  { href: '/app/equipe', icon: Users, label: 'Equipe' },
]

export const fieldNavigation: readonly NavigationItem[] = [
  { href: '/field', icon: Wrench, label: 'Atendimentos' },
]

export const officeRoles: readonly UserRole[] = ['OWNER', 'ADMIN']
export const fieldRoles: readonly UserRole[] = ['TECHNICIAN']

export function navigationForRole(role: UserRole): readonly NavigationItem[] {
  return role === 'TECHNICIAN' ? fieldNavigation : officeNavigation
}

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    OWNER: 'Proprietário',
    ADMIN: 'Administrador',
    TECHNICIAN: 'Técnico',
  }
  return labels[role]
}
