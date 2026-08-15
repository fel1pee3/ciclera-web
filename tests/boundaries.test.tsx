import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ErrorBoundary from '@/app/error'
import NotFound from '@/app/not-found'

describe('route boundaries', () => {
  it('offers a retry action for recoverable errors', () => {
    const retry = vi.fn()
    render(<ErrorBoundary error={new Error('test')} retry={retry} />)

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(retry).toHaveBeenCalledOnce()
  })

  it('offers a safe path home for unknown routes', () => {
    render(<NotFound />)

    expect(
      screen.getByRole('heading', { name: 'Página não encontrada.' }),
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Voltar ao início' }),
    ).toHaveAttribute('href', '/')
  })
})
