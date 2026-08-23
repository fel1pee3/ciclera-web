import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SubscriptionPaymentHistory } from '@/features/subscriptions/subscription-payment-history'
import type { SubscriptionPayment } from '@/features/subscriptions/contracts'

const mocks = vi.hoisted(() => ({
  listSubscriptionPayments: vi.fn(),
}))

vi.mock('@/features/subscriptions/api', () => ({
  listSubscriptionPayments: mocks.listSubscriptionPayments,
}))

describe('subscription payment history', () => {
  beforeEach(() => {
    mocks.listSubscriptionPayments.mockReset()
  })

  afterEach(cleanup)

  it('presents paid and pending records with the appropriate Asaas action', async () => {
    mocks.listSubscriptionPayments.mockResolvedValue({
      items: [
        payment({
          id: '10000000-0000-4000-8000-000000000001',
          status: 'RECEIVED',
          paymentMethod: 'PIX',
          paidAt: '2026-08-21T14:00:00.000Z',
        }),
        payment({
          id: '20000000-0000-4000-8000-000000000001',
          status: 'PENDING',
          paymentMethod: 'BOLETO',
          paidAt: null,
        }),
      ],
      page: 1,
      pageSize: 8,
      total: 2,
    })

    render(
      <SubscriptionPaymentHistory organizationTimezone="America/Sao_Paulo" />,
    )

    expect(await screen.findByText('Recebido')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Pix')).toBeInTheDocument()
    expect(screen.getByText('Boleto bancário')).toBeInTheDocument()
    expect(screen.getAllByText('R$ 199,00')).toHaveLength(2)
    expect(screen.getByText('Pago em 21/08/2026, 11:00')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver comprovante' }),
    ).toHaveAttribute('href', 'https://www.asaas.com/i/payment-id')
    expect(screen.getByRole('link', { name: 'Ver cobrança' })).toHaveAttribute(
      'href',
      'https://www.asaas.com/i/payment-id',
    )
  })

  it('shows an honest empty state', async () => {
    mocks.listSubscriptionPayments.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 8,
      total: 0,
    })

    render(
      <SubscriptionPaymentHistory organizationTimezone="America/Sao_Paulo" />,
    )

    expect(
      await screen.findByText('Nenhum pagamento registrado'),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(mocks.listSubscriptionPayments).toHaveBeenCalledWith({
        page: 1,
        pageSize: 8,
      }),
    )
  })
})

function payment(overrides: Partial<SubscriptionPayment>): SubscriptionPayment {
  return { ...basePayment(), ...overrides }
}

function basePayment(): SubscriptionPayment {
  return {
    id: '30000000-0000-4000-8000-000000000001',
    status: 'PENDING',
    paymentMethod: 'PIX',
    amountInCents: '19900',
    dueDate: '2026-08-21T00:00:00.000Z',
    paidAt: null as string | null,
    invoiceUrl: 'https://www.asaas.com/i/payment-id',
    createdAt: '2026-08-21T12:00:00.000Z',
  }
}
