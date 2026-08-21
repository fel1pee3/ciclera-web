import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RegistrationForm } from '@/features/auth/registration-form'
import { registrationSchema } from '@/features/auth/schemas'
import { isEmptyWorkspace } from '@/features/dashboard/revenue-dashboard'
import { ApiError } from '@/lib/api/errors'

const mocks = vi.hoisted(() => ({
  registerOrganization: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}))
vi.mock('@/features/auth/api', () => ({
  registerOrganization: mocks.registerOrganization,
}))

const account = {
  user: {
    id: '10000000-0000-4000-8000-000000000101',
    name: 'Maria Owner',
    email: 'maria@example.test',
    role: 'OWNER' as const,
  },
  organization: {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Empresa Tecnica',
    timezone: 'America/Sao_Paulo',
  },
}

describe('public registration', () => {
  beforeEach(() => {
    mocks.registerOrganization.mockReset()
    mocks.registerOrganization.mockResolvedValue(account)
    mocks.replace.mockReset()
    mocks.refresh.mockReset()
  })

  afterEach(cleanup)

  it('renders immediately without probing an unauthenticated session', () => {
    render(<RegistrationForm />)

    expect(
      screen.getByRole('heading', { name: 'Crie sua conta Ciclera' }),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Verificando sess/)).not.toBeInTheDocument()
  })

  it('validates password confirmation and mandatory legal acceptance', () => {
    const result = registrationSchema.safeParse({
      organizationName: 'Empresa Tecnica',
      ownerName: 'Maria Owner',
      email: 'maria@example.test',
      password: 'LocalOnly!2026',
      confirmPassword: 'different',
      termsAccepted: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined()
      expect(result.error.flatten().fieldErrors.termsAccepted).toBeDefined()
    }
  })

  it.each([
    ['password policy', { password: 'short', confirmPassword: 'short' }],
    [
      'uppercase password rule',
      { password: 'localonly!2026', confirmPassword: 'localonly!2026' },
    ],
    [
      'lowercase password rule',
      { password: 'LOCALONLY!2026', confirmPassword: 'LOCALONLY!2026' },
    ],
    [
      'number password rule',
      { password: 'LocalOnly!Password', confirmPassword: 'LocalOnly!Password' },
    ],
    [
      'symbol password rule',
      { password: 'LocalOnly2026', confirmPassword: 'LocalOnly2026' },
    ],
    ['valid e-mail', { email: 'invalid' }],
  ])('validates %s before submission', (_scenario, override) => {
    const result = registrationSchema.safeParse({
      organizationName: 'Empresa Tecnica',
      ownerName: 'Maria Owner',
      email: 'maria@example.test',
      password: 'LocalOnly!2026',
      confirmPassword: 'LocalOnly!2026',
      termsAccepted: true,
      ...override,
    })
    expect(result.success).toBe(false)
  })

  it('creates the account once and redirects the new OWNER to the app', async () => {
    render(<RegistrationForm />)
    await fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    await waitFor(() =>
      expect(mocks.registerOrganization).toHaveBeenCalledOnce(),
    )
    expect(mocks.replace).toHaveBeenCalledWith('/app')
    expect(mocks.refresh).toHaveBeenCalledOnce()
  })

  it('shows password requirements and lets the user reveal both passwords', async () => {
    render(<RegistrationForm />)
    await screen.findByRole('heading', { name: 'Crie sua conta Ciclera' })

    const password = screen.getByLabelText('Senha')
    expect(screen.getByLabelText('Nome da organização')).toHaveAttribute(
      'placeholder',
      'Ex.: Vértice Serviços Técnicos',
    )
    expect(screen.getByLabelText('Seu nome')).toHaveAttribute(
      'placeholder',
      'Ex.: José da Silva',
    )
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'placeholder',
      'voce@empresa.com.br',
    )
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveAttribute('placeholder', 'Crie uma senha segura')
    expect(screen.getByLabelText('Confirmar senha')).toHaveAttribute(
      'placeholder',
      'Digite a senha novamente',
    )
    expect(screen.getByText('0/5')).toBeInTheDocument()

    fireEvent.change(password, { target: { value: 'LocalOnly!2026' } })
    expect(await screen.findByText('5/5')).toBeInTheDocument()

    const revealButtons = screen.getAllByRole('button', {
      name: 'Mostrar senha',
    })
    expect(revealButtons).toHaveLength(2)
    fireEvent.click(revealButtons[0]!)
    expect(password).toHaveAttribute('type', 'text')
    expect(
      screen.getByRole('button', { name: 'Ocultar senha' }),
    ).toBeInTheDocument()
  })

  it('keeps typed values and shows an actionable duplicate e-mail error', async () => {
    mocks.registerOrganization.mockRejectedValue(
      new ApiError('conflict', 409, {
        type: 'problem',
        title: 'Conflict',
        status: 409,
        detail: 'Conflict',
        code: 'REGISTRATION_EMAIL_CONFLICT',
      }),
    )
    render(<RegistrationForm />)
    await fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Este e-mail j\u00e1 est\u00e1 vinculado',
    )
    expect(screen.getByLabelText('Nome da organiza\u00e7\u00e3o')).toHaveValue(
      'Empresa Tecnica',
    )
  })

  it.each([
    [429, 'Muitas tentativas'],
    [
      503,
      'cria\u00e7\u00e3o de contas est\u00e1 temporariamente indispon\u00edvel',
    ],
  ])('handles the recoverable HTTP status %s', async (status, message) => {
    mocks.registerOrganization.mockRejectedValue(
      new ApiError(
        'registration failed',
        status,
        status === 503
          ? {
              type: 'problem',
              title: 'Service Unavailable',
              status: 503,
              detail: 'Registration disabled',
              code: 'PUBLIC_REGISTRATION_DISABLED',
            }
          : undefined,
      ),
    )
    render(<RegistrationForm />)
    await fillForm()
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByLabelText('E-mail')).toHaveValue('maria@example.test')
  })

  it('blocks repeated submission while registration is in progress', async () => {
    let finishRegistration: ((value: typeof account) => void) | undefined
    mocks.registerOrganization.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishRegistration = resolve
        }),
    )
    render(<RegistrationForm />)
    await fillForm()
    const button = screen.getByRole('button', { name: 'Criar conta' })
    fireEvent.click(button)

    await waitFor(() => expect(button).toBeDisabled())
    expect(
      screen.getByRole('button', { name: 'Criando conta...' }),
    ).toBeDisabled()
    fireEvent.click(button)
    expect(mocks.registerOrganization).toHaveBeenCalledOnce()
    finishRegistration?.(account)
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith('/app'))
  })

  it('recognizes a genuinely empty operational workspace', () => {
    expect(
      isEmptyWorkspace({
        timezone: 'America/Sao_Paulo',
        period: { from: '2026-08-01', to: '2026-08-31' },
        setup: {
          activeUserCount: 1,
          customerCount: 0,
          locationCount: 0,
          equipmentCount: 0,
          workOrderCount: 0,
        },
        stages: {
          IN_PROGRESS: { count: 0, amountInCents: '0' },
          AWAITING_REVIEW: { count: 0, amountInCents: '0' },
          PENDING_CORRECTION: { count: 0, amountInCents: '0' },
          READY_TO_BILL: { count: 0, amountInCents: '0' },
          BILLED: { count: 0, amountInCents: '0' },
        },
        blockedAmountInCents: '0',
        averageReviewWaitingSeconds: null,
        oldestBlocked: [],
        recurringBlockers: [],
      }),
    ).toBe(true)
  })
})

async function fillForm() {
  await screen.findByRole('heading', { name: 'Crie sua conta Ciclera' })
  fireEvent.change(screen.getByLabelText('Nome da organiza\u00e7\u00e3o'), {
    target: { value: 'Empresa Tecnica' },
  })
  fireEvent.change(screen.getByLabelText('Seu nome'), {
    target: { value: 'Maria Owner' },
  })
  fireEvent.change(screen.getByLabelText('E-mail'), {
    target: { value: 'maria@example.test' },
  })
  fireEvent.change(screen.getByLabelText('Senha'), {
    target: { value: 'LocalOnly!2026' },
  })
  fireEvent.change(screen.getByLabelText('Confirmar senha'), {
    target: { value: 'LocalOnly!2026' },
  })
  fireEvent.click(screen.getByRole('checkbox'))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeEnabled(),
  )
}
