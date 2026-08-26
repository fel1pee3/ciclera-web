import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import PrivacyPage from '@/app/politica-de-privacidade/page'
import HomePage from '@/app/page'
import HowItWorksPage from '@/app/como-funciona/page'
import AudiencePage from '@/app/para-quem/page'
import PlansPage from '@/app/planos/page'
import QuestionsPage from '@/app/duvidas/page'
import FieldProductPage from '@/app/produto/execucao-em-campo/page'
import OperationsProductPage from '@/app/produto/gestao-operacional/page'
import ReviewProductPage from '@/app/produto/revisao-e-faturamento/page'
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
    expect(screen.getByText('Diagnóstico operacional')).toBeVisible()
    expect(screen.getByText('Fechamento da OS')).toBeVisible()
    expect(screen.getByText('Financeiro sem insumos para cobrar')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: /Encontre a informação certa sem atravessar uma página infinita/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('link', { name: /4 etapas conectadas/i }),
    ).toHaveAttribute('href', '/como-funciona')
    expect(
      screen.getByRole('link', { name: /A partir de R\$ 199\/mês/i }),
    ).toHaveAttribute('href', '/planos')
    expect(
      document.querySelectorAll('[data-nosnippet]').length,
    ).toBeGreaterThan(0)

    const productMenuButton = screen.getByRole('button', { name: 'Produto' })
    fireEvent.click(productMenuButton)
    expect(productMenuButton).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getAllByRole('link', { name: /Gestão operacional/i })[0],
    ).toHaveAttribute('href', '/produto/gestao-operacional')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(productMenuButton).toHaveAttribute('aria-expanded', 'false')

    const overviewTab = screen.getByRole('tab', {
      name: 'Visão operacional',
    })
    const ordersTab = screen.getByRole('tab', { name: 'Ordens' })
    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' })
    expect(ordersTab).toHaveFocus()
    expect(ordersTab).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('heading', { name: 'Ordens de serviço' }),
    ).toBeVisible()
  })

  it('preserves the published legal pages', () => {
    const { unmount } = render(<PrivacyPage />)
    expect(
      screen.getByRole('heading', {
        name: 'Política de Privacidade',
        level: 1,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: /Dados pessoais e informações tratadas/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: /Direitos do titular/i }),
    ).toBeVisible()
    expect(
      screen.getByText('A Ciclera não vende dados pessoais.'),
    ).toBeVisible()

    unmount()
    render(<TermsPage />)
    expect(
      screen.getByRole('heading', { name: 'Termos de Uso', level: 1 }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', { name: /Planos, limites e cobrança/i }),
    ).toBeVisible()
    expect(screen.getByText(/três dias completos de carência/i)).toBeVisible()
    expect(
      screen.getAllByRole('link', { name: 'Política de Privacidade' })[0],
    ).toHaveAttribute('href', '/politica-de-privacidade')
  })

  it('publishes useful product pages instead of duplicate landing anchors', () => {
    render(<OperationsProductPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Planeje o trabalho sem perder o contexto/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: /O histórico começa antes da primeira ordem/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByText('Gestão operacional', {
        selector: '[aria-current="page"]',
      }),
    ).toBeVisible()
    expect(screen.getByText('Base única')).toBeVisible()
    expect(screen.getByText('Agenda coordenada')).toBeVisible()
    expect(screen.getByText('Permissões claras')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: /Da base organizada à operação visível/i,
      }),
    ).toBeVisible()

    const relatedNavigation = screen.getByRole('navigation', {
      name: 'Outras áreas do produto',
    })
    expect(
      within(relatedNavigation).queryByRole('link', {
        name: /Gestão operacional/i,
      }),
    ).not.toBeInTheDocument()
    expect(
      within(relatedNavigation).getByRole('link', {
        name: /Execução em campo/i,
      }),
    ).toHaveAttribute('href', '/produto/execucao-em-campo')
    expect(
      within(relatedNavigation).getByRole('link', {
        name: /Revisão e faturamento/i,
      }),
    ).toHaveAttribute('href', '/produto/revisao-e-faturamento')
  })

  it('publishes dedicated editorial routes for the main navigation', () => {
    const pages = [
      [HowItWorksPage, /Cada registro prepara a próxima decisão/i],
      [AudiencePage, /Para quem executa fora e administra de dentro/i],
      [PlansPage, /O mesmo fluxo\. A capacidade certa para cada equipe/i],
      [QuestionsPage, /Decida com clareza antes de criar sua operação/i],
    ] as const

    for (const [Page, heading] of pages) {
      const { unmount } = render(<Page />)
      expect(
        screen.getByRole('heading', { level: 1, name: heading }),
      ).toBeVisible()
      unmount()
    }
  })

  it('uses meaningful editorial structures on the decision pages', () => {
    const { unmount } = render(<HowItWorksPage />)

    expect(
      screen.getByRole('list', { name: 'Resumo do fluxo da ordem' }).children,
    ).toHaveLength(4)
    expect(
      screen.getByRole('list', { name: 'Etapas do fluxo operacional' })
        .children,
    ).toHaveLength(4)
    expect(
      screen.getByRole('list', { name: 'Momentos do ciclo operacional' })
        .children,
    ).toHaveLength(3)

    unmount()
    render(<AudiencePage />)
    expect(
      screen.getByRole('complementary', {
        name: 'Perfil de operação atendido',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('list', { name: 'Segmentos atendidos' }).children,
    ).toHaveLength(6)

    unmount()
    render(<PlansPage />)
    expect(
      screen.getByRole('heading', {
        name: 'Condições claras desde o primeiro pagamento.',
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('list', { name: 'Condições da assinatura' }).children,
    ).toHaveLength(3)

    unmount()
    render(<QuestionsPage />)
    expect(
      screen.getByRole('list', { name: 'Assuntos respondidos' }).children,
    ).toHaveLength(3)
  })

  it('gives each product page a distinct visual narrative', () => {
    const { unmount } = render(<FieldProductPage />)
    expect(
      screen.getByAltText(/Técnico usando a Ciclera durante um atendimento/i),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: /Da agenda à revisão, sem sair da ordem/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('list', {
        name: 'Momentos da execução em campo',
      }).children,
    ).toHaveLength(2)
    expect(
      within(
        screen.getByRole('list', {
          name: 'Etapas da execução em campo',
        }),
      ).getAllByRole('listitem'),
    ).toHaveLength(4)

    const fieldNavigation = screen.getByRole('navigation', {
      name: 'Outras áreas do produto',
    })
    expect(
      within(fieldNavigation).queryByRole('link', {
        name: /Execução em campo/i,
      }),
    ).not.toBeInTheDocument()
    expect(
      within(fieldNavigation).getByRole('link', {
        name: /Gestão operacional/i,
      }),
    ).toHaveAttribute('href', '/produto/gestao-operacional')
    expect(
      within(fieldNavigation).getByRole('link', {
        name: /Revisão e faturamento/i,
      }),
    ).toHaveAttribute('href', '/produto/revisao-e-faturamento')

    unmount()
    render(<ReviewProductPage />)
    expect(screen.getByText('Receita conferida')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: /A entrega só vira receita depois da conferência/i,
      }),
    ).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'Recursos de revisão e faturamento',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('list', {
        name: 'Momentos da revisão administrativa',
      }).children,
    ).toHaveLength(2)
    const reviewFlow = screen.getByRole('list', {
      name: 'Etapas da revisão e faturamento',
    })
    expect(reviewFlow.children).toHaveLength(4)
    expect(within(reviewFlow).getByText('Solicitar correção')).toBeVisible()
    expect(within(reviewFlow).getByText('Aprovar execução')).toBeVisible()
  })
})
