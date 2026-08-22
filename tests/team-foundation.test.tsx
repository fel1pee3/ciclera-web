import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '@/lib/api/errors'
import { getTeamErrorMessage } from '@/features/team/errors'
import { canManageUser, creatableRoles } from '@/features/team/permissions'
import { createUserSchema } from '@/features/team/schemas'
import { TeamManagement } from '@/features/team/team-management'
import { CreateUserForm } from '@/features/team/user-form'

const mocks = vi.hoisted(() => ({
  listUsers: vi.fn(),
  setUserStatus: vi.fn(),
  deleteUser: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  account: {
    user: {
      id: '10000000-0000-4000-8000-000000000102',
      name: 'Administrador',
      email: 'admin@example.test',
      role: 'ADMIN' as 'OWNER' | 'ADMIN' | 'TECHNICIAN',
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
  deleteUser: mocks.deleteUser,
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
    cleanup()
    Object.assign(mocks.account.user, {
      id: '10000000-0000-4000-8000-000000000102',
      name: 'Administrador',
      email: 'admin@example.test',
      role: 'ADMIN',
    })
    mocks.listUsers.mockReset()
    mocks.setUserStatus.mockReset()
    mocks.deleteUser.mockReset()
    mocks.setUserStatus.mockResolvedValue({
      ...technician,
      status: 'INACTIVE',
    })
    mocks.deleteUser.mockResolvedValue({
      ...technician,
      name: 'Usuário excluído',
      email: `deleted.${technician.id}@users.invalid`,
      status: 'INACTIVE',
    })
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
      screen.queryByText('Somente um proprietário pode gerenciar este perfil.'),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Editar' })).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar pessoa' }))
    const createForm = screen
      .getByRole('dialog', { name: 'Adicionar pessoa' })
      .querySelector('form')
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
    expect(canManageUser('OWNER', owner)).toBe(false)
    expect(creatableRoles('OWNER')).toEqual(['ADMIN', 'TECHNICIAN'])
    expect(
      createUserSchema.safeParse({
        name: 'A',
        email: 'invalid',
        password: 'short',
        confirmPassword: 'different',
        role: 'TECHNICIAN',
      }).success,
    ).toBe(false)
    expect(
      createUserSchema.safeParse({
        name: 'Pessoa Teste',
        email: 'person@example.test',
        password: 'LocalOnly!2026',
        confirmPassword: 'LocalOnly!2026',
        role: 'TECHNICIAN',
      }).success,
    ).toBe(true)
  })

  it('requires a safe confirmed password and lets both values be revealed', async () => {
    const { container } = render(
      <CreateUserForm actorRole="OWNER" onSaved={vi.fn()} />,
    )
    const form = within(container)

    const submit = form.getByRole('button', { name: 'Adicionar à equipe' })
    const password = form.getByLabelText('Senha inicial')
    const confirmation = form.getByLabelText('Confirmar senha')

    expect(submit).toBeDisabled()
    expect(
      form.getByRole('option', { name: 'Administrador' }),
    ).toBeInTheDocument()
    expect(
      form.queryByRole('option', { name: 'Proprietário' }),
    ).not.toBeInTheDocument()
    expect(password).toHaveAttribute('type', 'password')
    expect(confirmation).toHaveAttribute('type', 'password')

    fireEvent.change(form.getByLabelText('Nome'), {
      target: { value: 'Pessoa Teste' },
    })
    fireEvent.change(form.getByLabelText('E-mail'), {
      target: { value: 'person@example.test' },
    })
    fireEvent.change(password, { target: { value: 'LocalOnly!2026' } })
    fireEvent.change(confirmation, { target: { value: 'Different!2026' } })

    expect(form.getByText('Senha segura')).toBeInTheDocument()
    await waitFor(() => expect(submit).toBeDisabled())

    fireEvent.click(form.getAllByRole('button', { name: 'Mostrar senha' })[0])
    fireEvent.click(form.getAllByRole('button', { name: 'Mostrar senha' })[0])
    expect(password).toHaveAttribute('type', 'text')
    expect(confirmation).toHaveAttribute('type', 'text')

    fireEvent.change(confirmation, { target: { value: 'LocalOnly!2026' } })
    await waitFor(() => expect(submit).toBeEnabled())
  })

  it('lets the owner edit all fields except assigning the OWNER profile', async () => {
    Object.assign(mocks.account.user, {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      role: 'OWNER',
    })

    render(<TeamManagement />)

    await screen.findByText('Proprietária')
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))

    const dialog = within(
      screen.getByRole('dialog', { name: 'Editar integrante' }),
    )
    expect(dialog.getByLabelText('Nome')).toHaveValue('Técnica')
    expect(dialog.getByLabelText('E-mail')).toHaveValue('tech@example.test')
    expect(dialog.getByLabelText('Nova senha (opcional)')).toHaveValue('')
    expect(dialog.getByLabelText('Confirmar nova senha')).toHaveValue('')
    expect(dialog.getByLabelText('Perfil')).toHaveValue('TECHNICIAN')
    expect(
      dialog.getByRole('option', { name: 'Administrador' }),
    ).toBeInTheDocument()
    expect(
      dialog.queryByRole('option', { name: 'Proprietário' }),
    ).not.toBeInTheDocument()
    fireEvent.change(dialog.getByLabelText('Perfil'), {
      target: { value: 'ADMIN' },
    })
    expect(dialog.getByLabelText('Perfil')).toHaveValue('ADMIN')

    fireEvent.click(dialog.getByRole('button', { name: 'Fechar' }))
    expect(
      screen.queryByRole('dialog', { name: 'Editar integrante' }),
    ).not.toBeInTheDocument()
  })

  it('keeps the owner card first, static, and without extra messages', async () => {
    Object.assign(mocks.account.user, {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      role: 'OWNER',
    })

    mocks.listUsers.mockResolvedValueOnce({
      items: [technician, owner],
      page: 1,
      pageSize: 12,
      total: 2,
    })

    render(<TeamManagement />)

    await screen.findByText('Proprietária')
    const cards = document.querySelectorAll('article')
    expect(cards[0]).toHaveTextContent('Proprietária')
    const ownerCard = cards[0]
    expect(ownerCard).not.toBeNull()
    const ownerActions = within(ownerCard as HTMLElement)
    expect(
      ownerActions.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument()
    expect(
      ownerActions.queryByRole('button', { name: 'Desativar' }),
    ).not.toBeInTheDocument()
    expect(
      ownerActions.queryByText(/protegida|gerenciar este perfil/i),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Editar' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Desativar' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Excluir' })).toHaveLength(1)
  })

  it('confirms deletion before removing a non-owner member', async () => {
    render(<TeamManagement />)

    await screen.findByText('Proprietária')
    fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    const dialog = within(
      screen.getByRole('dialog', { name: 'Excluir integrante?' }),
    )
    expect(mocks.deleteUser).not.toHaveBeenCalled()
    expect(
      dialog.getByText(/históricos já registrados serão preservados/i),
    ).toBeInTheDocument()
    fireEvent.click(dialog.getByRole('button', { name: 'Excluir integrante' }))

    await waitFor(() =>
      expect(mocks.deleteUser).toHaveBeenCalledWith(technician.id),
    )
  })

  it('confirms activation changes in a modal before calling the API', async () => {
    render(<TeamManagement />)

    await screen.findByText('Proprietária')
    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))

    let dialog = within(
      screen.getByRole('dialog', { name: 'Desativar integrante?' }),
    )
    expect(mocks.setUserStatus).not.toHaveBeenCalled()
    fireEvent.click(dialog.getByRole('button', { name: 'Cancelar' }))
    expect(
      screen.queryByRole('dialog', { name: 'Desativar integrante?' }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Desativar' }))
    dialog = within(
      screen.getByRole('dialog', { name: 'Desativar integrante?' }),
    )
    fireEvent.click(dialog.getByRole('button', { name: 'Desativar' }))

    await waitFor(() =>
      expect(mocks.setUserStatus).toHaveBeenCalledWith(
        technician.id,
        'INACTIVE',
      ),
    )
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
