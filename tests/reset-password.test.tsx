import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ResetPasswordForm } from '@/features/auth/reset-password-form'
import { resetPasswordSchema } from '@/features/auth/schemas'

const mocks = vi.hoisted(() => ({
  resetPassword: vi.fn(),
}))

vi.mock('@/features/auth/api', () => ({
  resetPassword: mocks.resetPassword,
}))

const token = 'a'.repeat(43)
const securePassword = 'NovaSenha!2026'

describe('password reset', () => {
  beforeEach(() => {
    mocks.resetPassword.mockReset()
    mocks.resetPassword.mockResolvedValue(undefined)
    window.location.hash = `token=${token}`
  })

  afterEach(() => {
    cleanup()
    window.history.replaceState(null, '', '/')
  })

  it('requires the same strong password policy used by registration', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'senhafraca',
        confirmPassword: 'senhafraca',
      }).success,
    ).toBe(false)
    expect(
      resetPasswordSchema.safeParse({
        password: securePassword,
        confirmPassword: 'OutraSenha!2026',
      }).success,
    ).toBe(false)
    expect(
      resetPasswordSchema.safeParse({
        password: securePassword,
        confirmPassword: securePassword,
      }).success,
    ).toBe(true)
  })

  it('shows requirements, placeholders and visibility controls', async () => {
    render(<ResetPasswordForm />)

    const password = await screen.findByLabelText('Nova senha')
    const confirmation = screen.getByLabelText('Confirmar nova senha')
    expect(password).toHaveAttribute('placeholder', 'Crie uma senha segura')
    expect(confirmation).toHaveAttribute(
      'placeholder',
      'Digite a nova senha novamente',
    )
    expect(screen.getByText('0/5')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Redefinir senha' }),
    ).toBeDisabled()

    const revealButtons = screen.getAllByRole('button', {
      name: 'Mostrar senha',
    })
    expect(revealButtons).toHaveLength(2)
    fireEvent.click(revealButtons[0]!)
    expect(password).toHaveAttribute('type', 'text')

    fireEvent.change(password, { target: { value: securePassword } })
    fireEvent.change(confirmation, { target: { value: securePassword } })

    expect(await screen.findByText('5/5')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Redefinir senha' }),
      ).toBeEnabled(),
    )
  })

  it('submits only a strong matching password', async () => {
    render(<ResetPasswordForm />)

    fireEvent.change(await screen.findByLabelText('Nova senha'), {
      target: { value: securePassword },
    })
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: securePassword },
    })
    const submit = screen.getByRole('button', { name: 'Redefinir senha' })
    await waitFor(() => expect(submit).toBeEnabled())
    fireEvent.click(submit)

    await waitFor(() =>
      expect(mocks.resetPassword).toHaveBeenCalledWith(token, securePassword),
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Senha redefinida',
    )
  })
})
