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
import { LeadForm } from '@/components/landing/lead-form'
import { Footer } from '@/components/landing/footer'

export default function Page() {
  return (
    <>
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
        <LeadForm />
        <FaqSection />
        <GetStartedSection />
      </main>
      <Footer />
    </>
  )
}
