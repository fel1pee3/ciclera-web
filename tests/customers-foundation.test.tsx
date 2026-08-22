import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CustomerDetail,
  safeCustomerReturn,
} from '@/features/customers/customer-detail'
import { CustomerForm } from '@/features/customers/customer-form'
import {
  findCustomer,
  listCustomers,
  listLocations,
} from '@/features/customers/api'
import type { Customer, ServiceLocation } from '@/features/customers/contracts'
import {
  CustomerList,
  customerListUrl,
  readCustomerQuery,
} from '@/features/customers/customer-list'

vi.mock('next/navigation', () => ({
  useParams: () => ({ customerId: '30000000-0000-4000-8000-000000000001' }),
  usePathname: () => '/app/clientes',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/features/customers/api', () => ({
  findCustomer: vi.fn(() => new Promise(() => undefined)),
  listLocations: vi.fn(() => new Promise(() => undefined)),
  listCustomers: vi.fn(() => new Promise(() => undefined)),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  archiveCustomer: vi.fn(),
  reactivateCustomer: vi.fn(),
}))

describe('customers web foundation', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('keeps valid filters and paging in the URL', () => {
    const query = readCustomerQuery(
      new URLSearchParams('page=3&archive=ARCHIVED&search=acme'),
    )

    expect(query).toEqual({
      page: 3,
      pageSize: 12,
      archive: 'ARCHIVED',
      search: 'acme',
    })
    expect(customerListUrl(query, 3)).toBe(
      '/app/clientes?page=3&search=acme&archive=ARCHIVED',
    )
  })

  it('rejects an external return URL', () => {
    expect(safeCustomerReturn('//example.test')).toBe('/app/clientes')
    expect(safeCustomerReturn('/app/clientes?page=2')).toBe(
      '/app/clientes?page=2',
    )
  })

  it('never renders an editable organization identifier', () => {
    render(<CustomerForm onSaved={vi.fn()} />)

    expect(screen.getByLabelText(/nome ou razão social/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/organiza/i)).not.toBeInTheDocument()
  })

  it('formats CNPJ, CPF, and Brazilian phone without moving a middle caret', async () => {
    render(<CustomerForm onSaved={vi.fn()} />)

    const cnpj = screen.getByLabelText('Número do CNPJ')
    fireEvent.change(cnpj, { target: { value: '12345678000190' } })
    expect(cnpj).toHaveValue('12.345.678/0001-90')
    cnpj.focus()
    fireEvent.change(cnpj, {
      target: {
        value: '12.345.68/0001-90',
        selectionStart: 8,
        selectionEnd: 8,
      },
    })
    expect(cnpj).toHaveValue('12.345.680/0019-0')
    await waitFor(() => expect(cnpj).toHaveFocus())
    await waitFor(() => expect(cnpj).toHaveProperty('selectionStart', 8))

    fireEvent.click(screen.getByLabelText('CPF'))
    const cpf = screen.getByLabelText('Número do CPF')
    expect(cpf).toHaveValue('')
    fireEvent.change(cpf, { target: { value: '12345678901' } })
    expect(cpf).toHaveValue('123.456.789-01')

    const phone = screen.getByLabelText('Telefone') as HTMLInputElement
    fireEvent.change(phone, { target: { value: '5' } })
    expect(phone).toHaveValue('+5')
    fireEvent.change(phone, { target: { value: '55' } })
    expect(phone).toHaveValue('+55')
    fireEvent.change(phone, { target: { value: '5585' } })
    expect(phone).toHaveValue('+55 (85)')
    fireEvent.change(phone, { target: { value: '5585933449080' } })
    expect(phone).toHaveValue('+55 (85) 93344-9080')
    phone.focus()
    fireEvent.change(phone, {
      target: {
        value: '+55 (85) 9344-9080',
        selectionStart: 11,
        selectionEnd: 11,
      },
    })
    expect(phone).toHaveValue('+55 (85) 9344-9080')
    await waitFor(() => expect(phone).toHaveProperty('selectionStart', 11))

    fireEvent.change(phone, { target: { value: '+55 (85)' } })
    phone.setSelectionRange(8, 8)
    fireEvent.keyDown(phone, { key: 'Backspace' })
    expect(phone).toHaveValue('+55 (8')
    fireEvent.change(phone, { target: { value: '+55 (' } })
    expect(phone).toHaveValue('+55')
    fireEvent.change(phone, { target: { value: '+5' } })
    expect(phone).toHaveValue('+5')

    fireEvent.change(phone, { target: { value: '5555912345678' } })
    expect(phone).toHaveValue('+55 (55) 91234-5678')
    fireEvent.change(phone, { target: { value: '' } })
    expect(phone).toHaveValue('')
  })

  it('renders a truthful loading state for the customer detail', () => {
    render(<CustomerDetail />)
    expect(screen.getByLabelText(/carregando cliente/i)).toBeInTheDocument()
  })

  it('opens customer, archive, and location actions in dialogs', async () => {
    const customer: Customer = {
      id: '30000000-0000-4000-8000-000000000001',
      name: 'Hotel Serra Verde Ltda.',
      document: '12345678000190',
      email: 'manutencao@hotelserraverde.com.br',
      phone: '5585933449080',
      notes: 'Acesso acompanhado.',
      archivedAt: null,
      createdAt: '2026-08-17T12:00:00.000Z',
      updatedAt: '2026-08-17T12:00:00.000Z',
    }
    const location: ServiceLocation = {
      id: '31000000-0000-4000-8000-000000000001',
      customerId: customer.id,
      name: 'Unidade Centro',
      postalCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1578',
      complement: 'Bloco A',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      contactName: 'Marcos Oliveira',
      contactPhone: '551134567891',
      accessInstructions: 'Apresentar documento na recepção.',
      status: 'ACTIVE',
      createdAt: '2026-08-17T12:00:00.000Z',
      updatedAt: '2026-08-17T12:00:00.000Z',
    }
    vi.mocked(findCustomer).mockResolvedValueOnce(customer)
    vi.mocked(listLocations).mockResolvedValueOnce({
      items: [location],
      page: 1,
      pageSize: 20,
      total: 1,
    })

    render(<CustomerDetail />)
    await screen.findByRole('heading', { name: customer.name })

    fireEvent.click(screen.getByRole('button', { name: 'Editar dados' }))
    expect(
      screen.getByRole('dialog', { name: 'Editar dados do cliente' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Editar dados do cliente' }),
      ).not.toBeInTheDocument(),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Arquivar cliente' }))
    expect(
      screen.getByRole('dialog', { name: 'Arquivar cliente?' }),
    ).toHaveTextContent('nenhum dado será excluído')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    fireEvent.click(screen.getByRole('button', { name: 'Editar local' }))
    expect(
      screen.getByRole('dialog', { name: 'Editar local' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar local' }))
    expect(
      screen.getByRole('dialog', { name: 'Adicionar local' }),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex.: 1578')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex.: Bela Vista')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex.: São Paulo')).toBeInTheDocument()

    const postalCode = screen.getByLabelText('CEP')
    fireEvent.change(postalCode, { target: { value: '013101009999' } })
    expect(postalCode).toHaveValue('01310-100')

    const locationPhone = screen.getByLabelText(
      'Telefone do local',
    ) as HTMLInputElement
    fireEvent.change(locationPhone, { target: { value: '551134567890' } })
    expect(locationPhone).toHaveValue('+55 (11) 3456-7890')
    locationPhone.focus()
    fireEvent.change(locationPhone, {
      target: {
        value: '+55 (11) 356-7890',
        selectionStart: 10,
        selectionEnd: 10,
      },
    })
    await waitFor(() =>
      expect(locationPhone).toHaveProperty('selectionStart', 10),
    )
  })

  it('opens new customer from the list without navigating away', async () => {
    vi.mocked(listCustomers).mockResolvedValueOnce({
      items: [],
      page: 1,
      pageSize: 12,
      total: 0,
    })

    render(<CustomerList />)
    await screen.findByText('Cadastre o primeiro cliente')
    fireEvent.click(screen.getByRole('button', { name: 'Novo cliente' }))

    const dialog = screen.getByRole('dialog', { name: 'Novo cliente' })
    expect(dialog).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Ex.: Hotel Serra Verde Ltda.'),
    ).toBeInTheDocument()
  })

  it('filters customers immediately without navigation or a clear-filters row', async () => {
    const activeCustomer: Customer = {
      id: '30000000-0000-4000-8000-000000000001',
      name: 'Hotel Serra Verde Ltda.',
      document: '12345678000190',
      email: 'manutencao@hotelserraverde.com.br',
      phone: '551134567890',
      notes: null,
      archivedAt: null,
      createdAt: '2026-08-17T12:00:00.000Z',
      updatedAt: '2026-08-17T12:00:00.000Z',
    }
    const archivedCustomer: Customer = {
      ...activeCustomer,
      id: '30000000-0000-4000-8000-000000000002',
      name: 'Clínica Bem-Estar',
      document: '23456789000101',
      email: 'infraestrutura@clinicabemestar.com.br',
      archivedAt: '2026-08-18T12:00:00.000Z',
    }

    vi.mocked(listCustomers).mockImplementation(async (query) => {
      const items = [activeCustomer, archivedCustomer].filter((customer) => {
        const matchesArchive =
          query.archive === 'ALL' ||
          (query.archive === 'ACTIVE' && !customer.archivedAt) ||
          (query.archive === 'ARCHIVED' && Boolean(customer.archivedAt))
        const term = query.search?.toLocaleLowerCase('pt-BR')
        const matchesSearch =
          !term ||
          customer.name.toLocaleLowerCase('pt-BR').includes(term) ||
          customer.document?.includes(term)
        return matchesArchive && matchesSearch
      })
      return {
        items,
        page: query.page,
        pageSize: query.pageSize,
        total: items.length,
      }
    })

    render(<CustomerList />)

    await screen.findByRole('heading', { name: activeCustomer.name })
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument()

    const search = screen.getByPlaceholderText('Nome ou documento')
    fireEvent.change(search, { target: { value: 'Serra' } })
    expect(
      screen.getByRole('button', { name: 'Limpar busca' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(listCustomers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        archive: 'ACTIVE',
        search: 'Serra',
      }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))
    expect(search).toHaveValue('')

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'ARCHIVED' },
    })
    await waitFor(() =>
      expect(listCustomers).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 12,
        archive: 'ARCHIVED',
      }),
    )
    expect(
      await screen.findByRole('heading', { name: archivedCustomer.name }),
    ).toBeInTheDocument()
  })

  it('confirms archiving from the customer list in a dialog', async () => {
    const customer: Customer = {
      id: '30000000-0000-4000-8000-000000000001',
      name: 'Hotel Serra Verde Ltda.',
      document: '12345678000190',
      email: 'manutencao@hotelserraverde.com.br',
      phone: '5585933449080',
      notes: null,
      archivedAt: null,
      createdAt: '2026-08-17T12:00:00.000Z',
      updatedAt: '2026-08-17T12:00:00.000Z',
    }
    vi.mocked(listCustomers).mockResolvedValueOnce({
      items: [customer],
      page: 1,
      pageSize: 12,
      total: 1,
    })

    render(<CustomerList />)
    await screen.findByRole('heading', { name: customer.name })
    fireEvent.click(screen.getByRole('button', { name: 'Arquivar' }))

    const dialog = screen.getByRole('dialog', { name: 'Arquivar cliente?' })
    expect(dialog).toHaveTextContent(customer.name)
    expect(dialog).toHaveTextContent('nenhum dado será excluído')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(
      screen.queryByRole('dialog', { name: 'Arquivar cliente?' }),
    ).not.toBeInTheDocument()
  })

  it('offers reactivation for an archived customer', async () => {
    const customer: Customer = {
      id: '30000000-0000-4000-8000-000000000001',
      name: 'Hotel Serra Verde Ltda.',
      document: '12345678000190',
      email: 'manutencao@hotelserraverde.com.br',
      phone: '5585933449080',
      notes: null,
      archivedAt: '2026-08-17T13:00:00.000Z',
      createdAt: '2026-08-17T12:00:00.000Z',
      updatedAt: '2026-08-17T13:00:00.000Z',
    }
    vi.mocked(listCustomers).mockResolvedValueOnce({
      items: [customer],
      page: 1,
      pageSize: 12,
      total: 1,
    })

    render(<CustomerList />)
    await screen.findByRole('heading', { name: customer.name })
    fireEvent.click(screen.getByRole('button', { name: 'Reativar' }))

    const dialog = screen.getByRole('dialog', { name: 'Reativar cliente?' })
    expect(dialog).toHaveTextContent('voltará para os clientes ativos')
    expect(
      screen.getByRole('button', { name: 'Reativar cliente' }),
    ).toBeInTheDocument()
  })
})
