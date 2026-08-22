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
const administrator = {
  ...owner,
  id: '20000000-0000-4000-8000-000000000003',
  name: 'Outra administradora',
  email: 'admin2@example.test',
  role: 'ADMIN' as const,
}
const currentAdministrator = {
  ...administrator,
  id: '10000000-0000-4000-8000-000000000102',
  name: 'Administrador atual',
  email: 'admin@example.test',
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

  it('lets an ADMIN manage technicians while protecting other administrators', async () => {
    mocks.listUsers.mockResolvedValue({
      items: [owner, administrator, technician],
      page: 1,
      pageSize: 12,
      total: 3,
    })
    render(<TeamManagement />)

    await screen.findByText('Proprietária')
    const administratorCard = (
      await screen.findByText(administrator.name)
    ).closest('article')
    expect(administratorCard).not.toBeNull()
    const administratorActions = within(administratorCard as HTMLElement)
    expect(
      administratorActions.getByText(
        'Somente um proprietário pode gerenciar este perfil.',
      ),
    ).toBeInTheDocument()
    expect(
      administratorActions.queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument()
    expect(
      administratorActions.queryByRole('button', { name: 'Desativar' }),
    ).not.toBeInTheDocument()
    expect(
      administratorActions.queryByRole('button', { name: 'Excluir' }),
    ).not.toBeInTheDocument()
    const technicianCard = (await screen.findByText(technician.name)).closest(
      'article',
    )
    expect(technicianCard).not.toBeNull()
    const technicianActions = within(technicianCard as HTMLElement)
    expect(
      technicianActions.getByRole('button', { name: 'Editar' }),
    ).toBeInTheDocument()
    expect(
      technicianActions.getByRole('button', { name: 'Desativar' }),
    ).toBeInTheDocument()
    expect(
      technicianActions.getByRole('button', { name: 'Excluir' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar pessoa' }))
    const createForm = screen
      .getByRole('dialog', { name: 'Adicionar pessoa' })
      .querySelector('form')
    expect(createForm).not.toBeNull()
    const form = within(createForm as HTMLFormElement)
    expect(
      form.queryByRole('option', { name: 'Administrador' }),
    ).not.toBeInTheDocument()
    expect(form.getByRole('option', { name: 'Técnico' })).toBeInTheDocument()
    expect(
      form.queryByRole('option', { name: 'Proprietário' }),
    ).not.toBeInTheDocument()
  })

  it('defines role permissions and validates safe creation input', () => {
    const adminActor = {
      id: mocks.account.user.id,
      role: 'ADMIN' as const,
    }
    expect(canManageUser(adminActor, owner)).toBe(false)
    expect(canManageUser(adminActor, administrator)).toBe(false)
    expect(canManageUser(adminActor, technician)).toBe(true)
    expect(
      canManageUser({ id: administrator.id, role: 'ADMIN' }, administrator),
    ).toBe(false)
    expect(canManageUser({ id: owner.id, role: 'OWNER' }, owner)).toBe(false)
    expect(creatableRoles('OWNER')).toEqual(['ADMIN', 'TECHNICIAN'])
    expect(creatableRoles('ADMIN')).toEqual(['TECHNICIAN'])
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

  it('lets an ADMIN edit their own access data without changing access level', async () => {
    mocks.listUsers.mockResolvedValue({
      items: [owner, currentAdministrator, administrator],
      page: 1,
      pageSize: 12,
      total: 3,
    })

    render(<TeamManagement />)

    const ownCard = (
      await screen.findByText(currentAdministrator.name)
    ).closest('article')
    expect(ownCard).not.toBeNull()
    const ownActions = within(ownCard as HTMLElement)
    expect(
      ownActions.getByRole('button', { name: 'Editar' }),
    ).toBeInTheDocument()
    expect(
      ownActions.queryByRole('button', { name: 'Desativar' }),
    ).not.toBeInTheDocument()
    expect(
      ownActions.queryByRole('button', { name: 'Excluir' }),
    ).not.toBeInTheDocument()

    fireEvent.click(ownActions.getByRole('button', { name: 'Editar' }))
    const dialog = within(
      screen.getByRole('dialog', { name: 'Editar integrante' }),
    )
    expect(dialog.getByLabelText('Nome')).toHaveValue(currentAdministrator.name)
    expect(dialog.getByLabelText('E-mail')).toHaveValue(
      currentAdministrator.email,
    )
    expect(dialog.getByLabelText('Nova senha (opcional)')).toBeInTheDocument()
    expect(dialog.queryByLabelText('Perfil')).not.toBeInTheDocument()
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
    const technicianCard = Array.from(
      document.querySelectorAll('article'),
    ).find((card) => card.textContent?.includes('Técnica'))
    expect(technicianCard).toBeDefined()
    fireEvent.click(
      within(technicianCard as HTMLElement).getByRole('button', {
        name: 'Editar',
      }),
    )

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

  it('lets the owner edit only their own access data', async () => {
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
      ownerActions.getByRole('button', { name: 'Editar' }),
    ).toBeInTheDocument()
    expect(
      ownerActions.queryByRole('button', { name: 'Desativar' }),
    ).not.toBeInTheDocument()
    expect(
      ownerActions.queryByRole('button', { name: 'Excluir' }),
    ).not.toBeInTheDocument()
    expect(
      ownerActions.queryByText(/protegida|gerenciar este perfil/i),
    ).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Editar' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Desativar' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Excluir' })).toHaveLength(1)

    fireEvent.click(ownerActions.getByRole('button', { name: 'Editar' }))
    const dialog = within(
      screen.getByRole('dialog', { name: 'Editar integrante' }),
    )
    expect(dialog.getByLabelText('Nome')).toHaveValue(owner.name)
    expect(dialog.getByLabelText('E-mail')).toHaveValue(owner.email)
    expect(dialog.getByLabelText('Nova senha (opcional)')).toBeInTheDocument()
    expect(dialog.queryByLabelText('Perfil')).not.toBeInTheDocument()
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

  it('filters the team while typing or changing selects without submitting', async () => {
    const inactiveTechnician = {
      ...technician,
      status: 'INACTIVE' as const,
    }
    const users = [owner, administrator, inactiveTechnician]
    mocks.listUsers.mockImplementation(
      async (query: {
        search?: string
        role?: string
        status?: string
        page: number
        pageSize: number
      }) => {
        const normalizedSearch = query.search?.toLowerCase()
        const items = users.filter(
          (user) =>
            (!normalizedSearch ||
              user.name.toLowerCase().includes(normalizedSearch) ||
              user.email.toLowerCase().includes(normalizedSearch)) &&
            (!query.role || user.role === query.role) &&
            (!query.status || user.status === query.status),
        )
        return {
          items,
          page: query.page,
          pageSize: query.pageSize,
          total: items.length,
        }
      },
    )

    render(<TeamManagement />)

    await screen.findByText(owner.name)
    expect(
      screen.queryByRole('button', { name: 'Aplicar filtros' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument()

    const search = screen.getByPlaceholderText('Nome ou e-mail')
    fireEvent.change(search, { target: { value: technician.email } })
    expect(
      screen.getByRole('button', { name: 'Limpar busca' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(mocks.listUsers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        search: technician.email,
      }),
    )
    await waitFor(() =>
      expect(screen.queryByText(owner.name)).not.toBeInTheDocument(),
    )
    expect(screen.getByText(technician.name)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))
    await screen.findByText(owner.name)
    expect(
      screen.queryByRole('button', { name: 'Limpar busca' }),
    ).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Perfil'), {
      target: { value: 'ADMIN' },
    })
    await waitFor(() =>
      expect(mocks.listUsers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        role: 'ADMIN',
      }),
    )
    expect(await screen.findByText(administrator.name)).toBeInTheDocument()
    expect(screen.queryByText(technician.name)).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Perfil'), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: 'INACTIVE' },
    })
    await waitFor(() =>
      expect(mocks.listUsers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        status: 'INACTIVE',
      }),
    )
    expect(await screen.findByText(technician.name)).toBeInTheDocument()
    expect(screen.queryByText(owner.name)).not.toBeInTheDocument()
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
