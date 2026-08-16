import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SignaturePad } from '@/features/field-work-orders/signature-pad'

describe('signature pad', () => {
  it('rejects an empty signature without starting an upload', () => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => null,
    })
    const onConfirm = vi.fn()
    render(<SignaturePad disabled={false} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Enviar assinatura' }))
    expect(
      screen.getByText('Faça a assinatura antes de enviar.'),
    ).toBeInTheDocument()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
