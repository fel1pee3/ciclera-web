import type { Metadata } from 'next'

import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import {
  PlanAssurances,
  PricingHero,
  PublicPageCta,
} from '@/components/landing/public-pages'
import { PricingSection } from '@/components/landing/sections'

export const metadata: Metadata = {
  title: 'Planos e preços para gestão de serviços externos',
  description:
    'Compare os planos da Ciclera por quantidade de técnicos, acessos administrativos e armazenamento de evidências.',
  alternates: { canonical: '/planos' },
  openGraph: {
    title: 'Planos e preços da Ciclera',
    description:
      'O fluxo operacional completo com a capacidade adequada para sua equipe.',
    url: '/planos',
  },
}

export default function PlansPage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <PricingHero />
        <PricingSection />
        <PlanAssurances />
        <PublicPageCta
          title="Escolha pelo tamanho da equipe, não por recursos escondidos."
          description="Todos os planos incluem ordens, agenda, campo, revisão e acompanhamento do faturamento."
        />
      </main>
      <Footer />
    </>
  )
}
