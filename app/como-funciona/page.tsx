import type { Metadata } from 'next'

import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import {
  HowItWorksHero,
  PublicPageCta,
} from '@/components/landing/public-pages'
import { FeaturesSection, WorkflowSection } from '@/components/landing/sections'

export const metadata: Metadata = {
  title: 'Como funciona a gestão de ordens de serviço',
  description:
    'Veja como a Ciclera conecta planejamento, execução em campo, evidências, revisão e faturamento em uma única ordem de serviço.',
  alternates: { canonical: '/como-funciona' },
  openGraph: {
    title: 'Como funciona a Ciclera | Gestão de ordens de serviço',
    description:
      'Uma linha contínua entre planejamento, campo, revisão e faturamento.',
    url: '/como-funciona',
  },
}

export default function HowItWorksPage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <HowItWorksHero />
        <WorkflowSection />
        <FeaturesSection />
        <PublicPageCta
          title="Coloque a próxima ordem nesse fluxo."
          description="Crie sua organização e conecte equipe, clientes, equipamentos e atendimento desde o primeiro registro."
        />
      </main>
      <Footer />
    </>
  )
}
