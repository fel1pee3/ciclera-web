import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CustomerDetail,
  safeCustomerReturn,
} from '@/features/customers/customer-detail'
import { CustomerForm } from '@/features/customers/customer-form'
import {
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
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  archiveCustomer: vi.fn(),
}))

describe('customers web foundation', () => {
  beforeEach(() => cleanup())

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

  it('formats CNPJ, CPF, and Brazilian phone while typing', () => {
    render(<CustomerForm onSaved={vi.fn()} />)

    const cnpj = screen.getByLabelText('Número do CNPJ')
    fireEvent.change(cnpj, { target: { value: '12345678000190' } })
    expect(cnpj).toHaveValue('12.345.678/0001-90')

    fireEvent.click(screen.getByLabelText('CPF'))
    const cpf = screen.getByLabelText('Número do CPF')
    expect(cpf).toHaveValue('')
    fireEvent.change(cpf, { target: { value: '12345678901' } })
    expect(cpf).toHaveValue('123.456.789-01')

    const phone = screen.getByLabelText('Telefone')
    fireEvent.change(phone, { target: { value: '85933449080' } })
    expect(phone).toHaveValue('+55 (85) 93344-9080')
  })

  it('renders a truthful loading state for the customer detail', () => {
    render(<CustomerDetail />)
    expect(screen.getByLabelText(/carregando cliente/i)).toBeInTheDocument()
  })
})
