import type { Metadata } from 'next'

import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { AudienceHero, PublicPageCta } from '@/components/landing/public-pages'
import { AudienceSection } from '@/components/landing/sections'

export const metadata: Metadata = {
  title: 'Sistema para empresas com equipes técnicas externas',
  description:
    'Conheça os tipos de operação B2B com equipes externas, equipamentos atendidos e ordens de serviço que mais se beneficiam da Ciclera.',
  alternates: { canonical: '/para-quem' },
  openGraph: {
    title: 'Para quem é a Ciclera | Equipes de serviço externo',
    description:
      'Para empresas que executam fora do escritório e precisam administrar com clareza.',
    url: '/para-quem',
  },
}

export default function AudiencePage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <AudienceHero />
        <AudienceSection />
        <PublicPageCta
          title="Sua equipe trabalha fora do escritório?"
          description="Estruture clientes, locais, equipamentos e ordens para o trabalho voltar completo ao administrativo."
        />
      </main>
      <Footer />
    </>
  )
}
