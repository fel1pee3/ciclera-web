import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { subscriptionAreaAccess } from '@/features/subscriptions/access-policy'
import {
  FieldSubscriptionArea,
  OfficeSubscriptionArea,
} from '@/features/subscriptions/subscription-area'
import { SubscriptionProvider } from '@/features/subscriptions/subscription-provider'
import type { CurrentSubscription } from '@/features/subscriptions/contracts'

const mocks = vi.hoisted(() => ({
  getCurrentSubscription: vi.fn(),
  pathname: '/app/clientes',
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))

vi.mock('@/features/subscriptions/api', () => ({
  getCurrentSubscription: mocks.getCurrentSubscription,
}))

vi.mock('@/features/auth/logout-button', () => ({
  LogoutButton: () => <button>Sair</button>,
}))

const owner = account('OWNER')
const admin = account('ADMIN')
const technician = account('TECHNICIAN')

describe('subscription access policy', () => {
  it('sends only the owner to the activation portal before the first payment', () => {
    const pending = subscription()

    expect(subscriptionAreaAccess(pending, 'OWNER', 'office')).toBe(
      'OWNER_PORTAL',
    )
    expect(subscriptionAreaAccess(pending, 'ADMIN', 'office')).toBe('BLOCKED')
    expect(subscriptionAreaAccess(pending, 'TECHNICIAN', 'field')).toBe(
      'BLOCKED',
    )
  })

  it('preserves operational access during the three-day grace period', () => {
    expect(
      subscriptionAreaAccess(
        subscription({
          planCode: 'ESSENTIAL',
          status: 'ACTIVE',
          access: 'FULL',
        }),
        'ADMIN',
        'office',
      ),
    ).toBe('OPERATIONAL')
    expect(
      subscriptionAreaAccess(
        subscription({
          planCode: 'ESSENTIAL',
          status: 'PAST_DUE',
          access: 'FULL',
        }),
        'TECHNICIAN',
        'field',
      ),
    ).toBe('OPERATIONAL')
  })

  it('blocks office users after the three-day grace period', () => {
    const blocked = subscription({
      planCode: 'ESSENTIAL',
      status: 'PAST_DUE',
      access: 'READ_ONLY',
    })

    expect(subscriptionAreaAccess(blocked, 'OWNER', 'office')).toBe(
      'OWNER_PORTAL',
    )
    expect(subscriptionAreaAccess(blocked, 'ADMIN', 'office')).toBe('BLOCKED')
    expect(subscriptionAreaAccess(blocked, 'TECHNICIAN', 'field')).toBe(
      'BLOCKED',
    )
  })
})

describe('subscription area boundary', () => {
  beforeEach(() => {
    mocks.pathname = '/app/clientes'
    mocks.replace.mockReset()
    mocks.refresh.mockReset()
    mocks.getCurrentSubscription.mockReset()
    mocks.getCurrentSubscription.mockResolvedValue(subscription())
  })

  afterEach(cleanup)

  it('does not mount operational content and redirects an unpaid owner', async () => {
    renderOffice(owner)

    await waitFor(() =>
      expect(mocks.replace).toHaveBeenCalledWith('/app/assinatura'),
    )
    expect(screen.queryByText('Conteúdo operacional')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Clientes' }),
    ).not.toBeInTheDocument()
  })

  it('shows the plan page in a clean portal without operational navigation', async () => {
    mocks.pathname = '/app/assinatura'
    renderOffice(owner, 'Escolha seu plano')

    expect(await screen.findByText('Escolha seu plano')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Clientes' }),
    ).not.toBeInTheDocument()
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  it('shows a clear block to a non-owner without mounting forms', async () => {
    renderOffice(admin)

    expect(
      await screen.findByRole('heading', {
        name: 'A organização ainda não foi ativada',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo operacional')).not.toBeInTheDocument()
  })

  it('keeps field access available with a warning during the grace period', async () => {
    mocks.pathname = '/field/ordens'
    mocks.getCurrentSubscription.mockResolvedValue(
      subscription({
        planCode: 'ESSENTIAL',
        status: 'PAST_DUE',
        access: 'FULL',
      }),
    )

    render(
      <SubscriptionProvider>
        <FieldSubscriptionArea account={technician}>
          <p>Atendimento em andamento</p>
        </FieldSubscriptionArea>
      </SubscriptionProvider>,
    )

    expect(
      await screen.findByText('Atendimento em andamento'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Pagamento em atraso — carência de 3 dias'),
    ).toBeInTheDocument()
  })
})

function renderOffice(
  currentAccount: typeof owner,
  content = 'Conteúdo operacional',
) {
  return render(
    <SubscriptionProvider>
      <OfficeSubscriptionArea account={currentAccount}>
        <p>{content}</p>
      </OfficeSubscriptionArea>
    </SubscriptionProvider>,
  )
}

function account(role: 'OWNER' | 'ADMIN' | 'TECHNICIAN') {
  return {
    user: {
      id: '10000000-0000-4000-8000-000000000001',
      name: 'Pessoa Usuária',
      email: 'pessoa@example.test',
      role,
    },
    organization: {
      id: '20000000-0000-4000-8000-000000000001',
      name: 'Organização Teste',
      timezone: 'America/Sao_Paulo',
    },
  }
}

function subscription(
  overrides: Partial<CurrentSubscription> = {},
): CurrentSubscription {
  return {
    id: '30000000-0000-4000-8000-000000000001',
    organizationId: '20000000-0000-4000-8000-000000000001',
    planCode: null,
    scheduledPlanCode: null,
    status: 'PENDING',
    paymentMethod: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    nextDueDate: null,
    overdueSince: null,
    cancelAtPeriodEnd: false,
    canceledAt: null,
    enforcementEnabled: true,
    latestInvoiceUrl: null,
    access: 'READ_ONLY',
    plan: null,
    scheduledPlan: null,
    usage: {
      technicians: 0,
      administrativeUsers: 1,
      evidenceStorageBytes: 0,
    },
    ...overrides,
  }
}
