import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AccountSummary } from '@/components/layout/account-summary'
import {
  fieldNavigation,
  fieldRoles,
  navigationForRole,
  officeNavigation,
  officeRoles,
} from '@/config/navigation'
import {
  AccessDenied,
  SessionUnavailable,
} from '@/features/auth/session-states'

const account = {
  user: {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Ana Ciclera',
    email: 'ana@local.test',
    role: 'OWNER' as const,
  },
  organization: {
    id: '20000000-0000-4000-8000-000000000001',
    name: 'Oficina Local',
    timezone: 'America/Sao_Paulo',
  },
}

describe('protected layout foundation', () => {
  it('separates office and field roles and navigation', () => {
    expect(officeRoles).toEqual(['OWNER', 'ADMIN'])
    expect(fieldRoles).toEqual(['TECHNICIAN'])
    expect(navigationForRole('OWNER')).toBe(officeNavigation)
    expect(navigationForRole('TECHNICIAN')).toBe(fieldNavigation)
    expect(
      officeNavigation.find((item) => item.href === '/app/assinatura'),
    ).toMatchObject({ roles: ['OWNER'] })
  })

  it('identifies the user, role, and organization in the shell', () => {
    render(<AccountSummary account={account} />)
    expect(screen.getByText('Ana Ciclera')).toBeInTheDocument()
    expect(screen.getByText(/Proprietário · Oficina Local/)).toBeInTheDocument()
  })

  it('provides explicit denied and unavailable states', () => {
    const { rerender } = render(<AccessDenied />)
    expect(
      screen.getByRole('heading', { name: 'Acesso não permitido' }),
    ).toBeInTheDocument()

    rerender(<SessionUnavailable retry={async () => undefined} />)
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeInTheDocument()
  })
})
