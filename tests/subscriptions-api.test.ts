import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createSubscriptionCheckout,
  getCurrentSubscription,
} from '@/features/subscriptions/api'

describe('subscription API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('parses organization access, plan capacity and the owner billing link', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json(currentSubscription)),
    )

    await expect(getCurrentSubscription()).resolves.toMatchObject({
      planCode: 'ESSENTIAL',
      enforcementEnabled: true,
      latestInvoiceUrl: 'https://www.asaas.com/i/payment-id',
      plan: { priceInCents: 19_900, maxTechnicians: 5 },
    })
  })

  it('sends only plan and method, never a client-controlled amount', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        checkoutUrl:
          'https://sandbox.asaas.com/checkoutSession/show/checkout-id',
        expiresAt: '2026-08-21T16:00:00.000Z',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await createSubscriptionCheckout('PROFESSIONAL', 'CREDIT_CARD')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/subscriptions/checkout'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          planCode: 'PROFESSIONAL',
          paymentMethod: 'CREDIT_CARD',
        }),
      }),
    )
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).not.toContain('amount')
  })

  it('sends the Pix billing profile without a client-controlled amount', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        checkoutUrl: 'https://www.asaas.com/i/payment-id',
        expiresAt: '2026-08-21T16:00:00.000Z',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await createSubscriptionCheckout('ESSENTIAL', 'PIX', {
      cpfCnpj: '12345678901',
      mobilePhone: '5511999999999',
      postalCode: '01310100',
      address: 'Avenida Paulista',
      addressNumber: '1578',
      province: 'Bela Vista',
    })

    const requestBody = String(fetchMock.mock.calls[0]?.[1]?.body)
    expect(JSON.parse(requestBody)).toMatchObject({
      planCode: 'ESSENTIAL',
      paymentMethod: 'PIX',
      billingProfile: {
        cpfCnpj: '12345678901',
        postalCode: '01310100',
      },
    })
    expect(requestBody).not.toContain('amount')
  })
})

const currentSubscription = {
  id: '10000000-0000-4000-8000-000000000001',
  organizationId: '20000000-0000-4000-8000-000000000001',
  planCode: 'ESSENTIAL',
  scheduledPlanCode: null,
  status: 'PAST_DUE',
  paymentMethod: 'PIX',
  currentPeriodStart: '2026-07-21T12:00:00.000Z',
  currentPeriodEnd: '2026-08-21T12:00:00.000Z',
  nextDueDate: '2026-08-21T00:00:00.000Z',
  overdueSince: '2026-08-21T00:00:00.000Z',
  cancelAtPeriodEnd: false,
  canceledAt: null,
  enforcementEnabled: true,
  latestInvoiceUrl: 'https://www.asaas.com/i/payment-id',
  access: 'FULL',
  plan: {
    code: 'ESSENTIAL',
    name: 'Essencial',
    priceInCents: 19_900,
    maxTechnicians: 5,
    maxAdministrativeUsers: 3,
    evidenceStorageBytes: 5 * 1024 * 1024 * 1024,
  },
  scheduledPlan: null,
  usage: {
    technicians: 2,
    administrativeUsers: 1,
    evidenceStorageBytes: 1_024,
  },
}
