import type { Metadata } from 'next'

import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { PublicPageCta, QuestionsHero } from '@/components/landing/public-pages'
import { FaqSection } from '@/components/landing/sections'
import { faqs } from '@/components/landing/content'
import { getAppUrl } from '@/lib/app-url'

export const metadata: Metadata = {
  title: 'Dúvidas frequentes sobre a Ciclera',
  description:
    'Tire dúvidas sobre funcionamento, acesso, planos, cobrança, equipe, segurança e limites da plataforma Ciclera.',
  alternates: { canonical: '/duvidas' },
  openGraph: {
    title: 'Dúvidas frequentes | Ciclera',
    description:
      'Respostas diretas sobre produto, operação, cobrança e acesso.',
    url: '/duvidas',
  },
}

export default function QuestionsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: `${getAppUrl()}/duvidas`,
    mainEntity: faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <QuestionsHero />
        <FaqSection />
        <PublicPageCta
          title="A resposta principal é ver o fluxo funcionando."
          description="Crie sua organização e comece a estruturar uma operação real no navegador."
        />
      </main>
      <Footer />
    </>
  )
}
