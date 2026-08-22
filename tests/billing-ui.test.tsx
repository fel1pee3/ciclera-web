import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { listReadyForBilling } from '@/features/billing/api'
import { BillingReadyList } from '@/features/billing/billing-ready-list'
import { listCustomers } from '@/features/customers/api'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/features/billing/api', () => ({
  downloadBillingCsv: vi.fn(),
  listReadyForBilling: vi.fn(),
  markWorkOrderBilled: vi.fn(),
}))

vi.mock('@/features/customers/api', () => ({
  listCustomers: vi.fn(),
}))

describe('billing filters', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.mocked(listReadyForBilling).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalAmountInCents: '0',
    })
    vi.mocked(listCustomers).mockResolvedValue({
      items: [
        {
          id: '50000000-0000-4000-8000-000000000001',
          name: 'Hotel Horizonte Azul Ltda.',
          document: '11222333000181',
          email: 'contato@example.com',
          phone: '11999999999',
          notes: null,
          archivedAt: null,
          createdAt: '2026-08-22T12:00:00.000Z',
          updatedAt: '2026-08-22T12:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 100,
      total: 1,
    })
  })

  it('updates results automatically and has no apply or clear buttons', async () => {
    render(<BillingReadyList />)

    await screen.findByText('Nenhuma ordem pronta para faturar')
    expect(screen.queryByText('Aplicar filtros')).not.toBeInTheDocument()
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Cliente' }), {
      target: { value: '50000000-0000-4000-8000-000000000001' },
    })
    await waitFor(() =>
      expect(listReadyForBilling).toHaveBeenLastCalledWith(
        expect.objectContaining({
          customerId: '50000000-0000-4000-8000-000000000001',
        }),
      ),
    )

    fireEvent.change(screen.getByLabelText('Valor mínimo'), {
      target: { value: '1.250,50' },
    })
    await waitFor(() =>
      expect(listReadyForBilling).toHaveBeenLastCalledWith(
        expect.objectContaining({ minimumAmountInCents: '125050' }),
      ),
    )
  })
})
