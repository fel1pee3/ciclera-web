import { render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/api/errors'
import { getTeamErrorMessage } from '@/features/team/errors'
import { canManageUser, creatableRoles } from '@/features/team/permissions'
import { createUserSchema } from '@/features/team/schemas'
import { TeamManagement } from '@/features/team/team-management'

const mocks = vi.hoisted(() => ({
  listUsers: vi.fn(),
  setUserStatus: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  account: {
    user: {
      id: '10000000-0000-4000-8000-000000000102',
      name: 'Administrador',
      email: 'admin@example.test',
      role: 'ADMIN' as const,
    },
    organization: {
      id: '10000000-0000-4000-8000-000000000001',
      name: 'Organização Teste',
      timezone: 'America/Sao_Paulo',
    },
  },
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/features/auth/session-provider', () => ({
  useSession: () => ({ account: mocks.account }),
}))
vi.mock('@/features/team/api', () => ({
  listUsers: mocks.listUsers,
  setUserStatus: mocks.setUserStatus,
  createUser: mocks.createUser,
  updateUser: mocks.updateUser,
}))

const owner = {
  id: '20000000-0000-4000-8000-000000000001',
  name: 'Proprietária',
  email: 'owner@example.test',
  role: 'OWNER' as const,
  status: 'ACTIVE' as const,
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T00:00:00.000Z',
}
const technician = {
  ...owner,
  id: '20000000-0000-4000-8000-000000000002',
  name: 'Técnica',
  email: 'tech@example.test',
  role: 'TECHNICIAN' as const,
}

describe('team management foundation', () => {
  beforeEach(() => {
    mocks.listUsers.mockReset()
    mocks.listUsers.mockResolvedValue({
      items: [owner, technician],
      page: 1,
      pageSize: 12,
      total: 2,
    })
  })

  it('keeps ADMIN actions restricted to technicians', async () => {
    render(<TeamManagement />)

    await screen.findByText('Proprietária')
    expect(
      screen.getByText('Somente um proprietário pode gerenciar este perfil.'),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Editar' })).toHaveLength(1)
    const createForm = screen
      .getByRole('heading', { name: 'Adicionar pessoa' })
      .closest('form')
    expect(createForm).not.toBeNull()
    const form = within(createForm as HTMLFormElement)
    expect(form.getByRole('option', { name: 'Técnico' })).toBeInTheDocument()
    expect(
      form.queryByRole('option', { name: 'Proprietário' }),
    ).not.toBeInTheDocument()
  })

  it('defines role permissions and validates safe creation input', () => {
    expect(canManageUser('ADMIN', owner)).toBe(false)
    expect(canManageUser('ADMIN', technician)).toBe(true)
    expect(creatableRoles('OWNER')).toEqual(['OWNER', 'ADMIN', 'TECHNICIAN'])
    expect(
      createUserSchema.safeParse({
        name: 'A',
        email: 'invalid',
        password: 'short',
        role: 'TECHNICIAN',
      }).success,
    ).toBe(false)
  })

  it('maps API conflicts to actionable messages', () => {
    const conflict = new ApiError('conflict', 409, {
      type: 'problem',
      title: 'Conflito',
      status: 409,
      detail: 'conflict',
      code: 'EMAIL_ALREADY_IN_USE',
    })
    expect(getTeamErrorMessage(conflict)).toContain('já está vinculado')
  })

  it('loads server-side pagination parameters', async () => {
    render(<TeamManagement />)
    await waitFor(() => expect(mocks.listUsers.mock.calls).toHaveLength(1))
    expect(mocks.listUsers.mock.calls[0]?.[0]).toEqual({
      page: 1,
      pageSize: 12,
    })
  })
})
