import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import PrivacyPage from '@/app/politica-de-privacidade/page'
import HomePage from '@/app/page'
import TermsPage from '@/app/termos-de-uso/page'

describe('public pages', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('preserves the landing content and public access actions', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Nenhum serviço executado deve ficar sem faturar/i,
      }),
    ).toBeVisible()
    expect(
      screen.getAllByRole('link', { name: 'Criar conta' })[0],
    ).toHaveAttribute('href', '/registro')
    expect(screen.getAllByRole('link', { name: 'Entrar' })[0]).toHaveAttribute(
      'href',
      '/login',
    )
    expect(document.body).not.toHaveTextContent(/programa piloto/i)
    expect(document.body).not.toHaveTextContent(/solicitar acesso/i)
    expect(document.body).not.toHaveTextContent(/Fale com a equipe/i)
    expect(
      screen.getByText(
        /Centralize ordens de serviço, técnicos, clientes, equipamentos/i,
      ),
    ).toHaveAttribute('data-nosnippet')
  })

  it('preserves the published legal pages', () => {
    const { unmount } = render(<PrivacyPage />)
    expect(
      screen.getByRole('heading', {
        name: 'Política de Privacidade',
        level: 1,
      }),
    ).toBeVisible()

    unmount()
    render(<TermsPage />)
    expect(
      screen.getByRole('heading', { name: 'Termos de Uso', level: 1 }),
    ).toBeVisible()
  })
})
