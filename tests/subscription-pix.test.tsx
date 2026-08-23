import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PixBillingProfileForm } from '@/features/subscriptions/pix-billing-profile-form'

describe('Pix billing profile', () => {
  afterEach(cleanup)

  it('normalizes billing data before requesting the monthly Pix charge', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    render(
      <PixBillingProfileForm
        pending={false}
        onBack={vi.fn()}
        onSubmit={submit}
      />,
    )

    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), {
      target: { value: '12345678901' },
    })
    fireEvent.change(screen.getByPlaceholderText('+55 (85) 93344-9080'), {
      target: { value: '5511999999999' },
    })
    fireEvent.change(screen.getByPlaceholderText('00000-000'), {
      target: { value: '01310100' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ex.: Avenida Paulista'), {
      target: { value: 'Avenida Paulista' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ex.: 1578'), {
      target: { value: '1578' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ex.: Bela Vista'), {
      target: { value: 'Bela Vista' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Gerar cobrança Pix' }))

    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith({
        cpfCnpj: '12345678901',
        mobilePhone: '5511999999999',
        postalCode: '01310100',
        address: 'Avenida Paulista',
        addressNumber: '1578',
        complement: undefined,
        province: 'Bela Vista',
      }),
    )
  })

  it('does not submit incomplete Pix billing data', async () => {
    const submit = vi.fn()
    render(
      <PixBillingProfileForm
        pending={false}
        onBack={vi.fn()}
        onSubmit={submit}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Gerar cobrança Pix' }))

    expect(
      await screen.findByText('Informe um CPF com 11 dígitos.'),
    ).toBeInTheDocument()
    expect(submit).not.toHaveBeenCalled()
  })
})
