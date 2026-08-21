import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PublicAuthRoute } from '@/features/auth/public-auth-route'
import { ApiError } from '@/lib/api/errors'

const mocks = vi.hoisted(() => ({
  getCurrentAccount: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))
vi.mock('@/features/auth/api', () => ({
  getCurrentAccount: mocks.getCurrentAccount,
}))

const account = {
  user: {
    id: '10000000-0000-4000-8000-000000000101',
    name: 'Owner',
    email: 'owner@example.test',
    role: 'OWNER' as const,
  },
  organization: {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Organization',
    timezone: 'America/Sao_Paulo',
  },
}

describe('public authentication routes', () => {
  beforeEach(() => {
    mocks.getCurrentAccount.mockReset()
    mocks.replace.mockReset()
    mocks.refresh.mockReset()
  })

  afterEach(cleanup)

  it('redirects an existing administrative session to the office area', async () => {
    mocks.getCurrentAccount.mockResolvedValue(account)

    render(
      <PublicAuthRoute>
        <p>Formulário de acesso</p>
      </PublicAuthRoute>,
    )

    expect(screen.getByText('Preparando seu acesso…')).toBeInTheDocument()
    expect(screen.queryByText('Formulário de acesso')).not.toBeInTheDocument()
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/app'))
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })

  it('redirects an existing technician session to the field area', async () => {
    mocks.getCurrentAccount.mockResolvedValue({
      ...account,
      user: { ...account.user, role: 'TECHNICIAN' },
    })

    render(
      <PublicAuthRoute>
        <p>Formulário de acesso</p>
      </PublicAuthRoute>,
    )

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/field'))
  })

  it('shows the requested form when no renewable session exists', async () => {
    mocks.getCurrentAccount.mockRejectedValue(
      new ApiError('Sessão ausente.', 401),
    )

    render(
      <PublicAuthRoute>
        <p>Formulário de acesso</p>
      </PublicAuthRoute>,
    )

    expect(await screen.findByText('Formulário de acesso')).toBeInTheDocument()
    expect(mocks.replace).not.toHaveBeenCalled()
  })
})
