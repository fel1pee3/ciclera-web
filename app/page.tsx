import type { Metadata } from 'next'

import { Header } from '@/components/landing/header'
import { Hero } from '@/components/landing/hero'
import {
  PositioningStrip,
  ProblemSection,
  WorkflowSection,
  DemoSection,
  FeaturesSection,
  FieldSection,
  AudienceSection,
  BenefitsSection,
  GetStartedSection,
  FaqSection,
} from '@/components/landing/sections'
import { Footer } from '@/components/landing/footer'
import { getAppUrl } from '@/lib/app-url'
import {
  buildHomeStructuredData,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SOCIAL_DESCRIPTION,
  SOCIAL_TITLE,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SOCIAL_TITLE,
    description: SOCIAL_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function Page() {
  const structuredData = buildHomeStructuredData(getAppUrl())

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
        <Hero />
        <PositioningStrip />
        <ProblemSection />
        <WorkflowSection />
        <DemoSection />
        <FeaturesSection />
        <FieldSection />
        <AudienceSection />
        <BenefitsSection />
        <FaqSection />
        <GetStartedSection />
      </main>
      <Footer />
    </>
  )
}
