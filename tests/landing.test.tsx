import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import PrivacyPage from '@/app/politica-de-privacidade/page'
import HomePage from '@/app/page'
import TermsPage from '@/app/termos-de-uso/page'
import { LeadForm } from '@/components/landing/lead-form'

describe('public pages', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('preserves the landing content and lead form', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Nenhum serviço executado deve ficar sem faturar/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Falar com a equipe' }),
    ).toBeEnabled()
    expect(
      screen.getAllByRole('link', { name: 'Criar conta' })[0],
    ).toHaveAttribute('href', '/registro')
    expect(screen.getAllByRole('link', { name: 'Entrar' })[0]).toHaveAttribute(
      'href',
      '/login',
    )
    expect(document.body).not.toHaveTextContent(/programa piloto/i)
    expect(document.body).not.toHaveTextContent(/solicitar acesso/i)
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

  it('submits valid lead data and only displays success after delivery', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    render(<LeadForm />)

    fireEvent.change(screen.getByLabelText('Nome completo'), {
      target: { value: 'Maria da Silva' },
    })
    fireEvent.change(screen.getByLabelText('Empresa'), {
      target: { value: 'Empresa Técnica' },
    })
    fireEvent.change(screen.getByLabelText('Cargo ou função'), {
      target: { value: 'Gerente operacional' },
    })
    fireEvent.change(screen.getByLabelText('E-mail corporativo'), {
      target: { value: 'maria@example.com' },
    })
    fireEvent.change(screen.getByLabelText('WhatsApp'), {
      target: { value: '11999999999' },
    })
    fireEvent.change(screen.getByLabelText('Cidade e estado'), {
      target: { value: 'São Paulo, SP' },
    })
    fireEvent.change(screen.getByLabelText('Quantidade de técnicos'), {
      target: { value: '5–10' },
    })
    fireEvent.change(screen.getByLabelText('OS aproximadas por mês'), {
      target: { value: '51–100' },
    })
    fireEvent.change(screen.getByLabelText('Controle atual'), {
      target: { value: 'Planilhas' },
    })
    fireEvent.change(
      screen.getByLabelText(
        'Principal dificuldade entre execução e faturamento',
      ),
      { target: { value: 'Conferência manual de todas as evidências.' } },
    )
    fireEvent.click(
      screen.getByLabelText(
        'Concordo em receber contato da equipe Ciclera sobre a plataforma.',
      ),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Falar com a equipe' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Recebemos seus dados.',
    )
  })
})
