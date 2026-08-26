import type { LucideIcon } from 'lucide-react'
import { ArrowRight, ArrowUpRight, FileText, Mail } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'

type NavigationItem = readonly [label: string, id: string]

type LegalSummary = {
  icon: LucideIcon
  title: string
  description: string
}

type LegalPageShellProps = {
  eyebrow: string
  title: string
  description: string
  version: string
  updatedAt: string
  navigationLabel: string
  navigation: readonly NavigationItem[]
  summary: readonly LegalSummary[]
  email: string
  counterpart: {
    label: string
    title: string
    description: string
    href: string
  }
  children: ReactNode
}

function DocumentNavigation({
  label,
  navigation,
}: {
  label: string
  navigation: readonly NavigationItem[]
}) {
  return (
    <nav aria-label={label}>
      <ol className="mt-5 space-y-1">
        {navigation.map(([itemLabel, id]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="group grid min-h-10 grid-cols-[2rem_1fr] items-center gap-2 border-l border-border px-3 text-xs leading-5 text-muted-foreground transition-colors hover:border-primary hover:bg-card hover:text-foreground"
            >
              <span className="font-bold text-primary">
                {itemLabel.split('.')[0].padStart(2, '0')}
              </span>
              <span>{itemLabel.replace(/^\d+\.\s*/, '')}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function LegalPageShell({
  eyebrow,
  title,
  description,
  version,
  updatedAt,
  navigationLabel,
  navigation,
  summary,
  email,
  counterpart,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="bg-background">
        <section className="overflow-hidden bg-institutional text-primary-foreground">
          <div className="container-page grid gap-12 py-14 sm:py-18 lg:grid-cols-[1.15fr_.55fr] lg:items-end lg:py-24">
            <div>
              <nav aria-label="Navegação estrutural" className="text-xs">
                <ol className="flex items-center gap-2 text-primary-foreground/55">
                  <li>
                    <Link href="/" className="hover:text-primary-foreground">
                      Início
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li className="text-active">Legal</li>
                </ol>
              </nav>
              <p className="mt-12 text-xs font-bold uppercase tracking-[.2em] text-active">
                {eyebrow}
              </p>
              <h1 className="mt-5 max-w-4xl text-balance font-heading text-[clamp(2.6rem,5.6vw,5.25rem)] font-semibold leading-[1.01] tracking-[-.045em]">
                {title}
              </h1>
              <p className="mt-7 max-w-3xl text-pretty text-base leading-8 text-primary-foreground/68 sm:text-lg">
                {description}
              </p>
            </div>
            <div className="border-t border-primary-foreground/18 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary-foreground/65">
                Documento vigente
              </p>
              <p className="mt-3 font-heading text-xl font-semibold">
                {version}
              </p>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/60">
                Última atualização
                <br />
                {updatedAt}
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Resumo do documento"
          className="border-b border-border bg-card"
        >
          <div className="container-page grid border-l border-border md:grid-cols-3">
            {summary.map(
              ({
                icon: Icon,
                title: itemTitle,
                description: itemDescription,
              }) => (
                <div
                  key={itemTitle}
                  className="grid min-h-40 grid-cols-[2.75rem_1fr] gap-4 border-b border-r border-border px-5 py-7 last:border-b-0 md:border-b-0 sm:px-7"
                >
                  <span className="grid size-10 place-items-center bg-primary/8 text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <div>
                    <h2 className="font-heading text-base font-semibold">
                      {itemTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {itemDescription}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <article className="container-page py-14 sm:py-18 lg:py-24">
          <details className="mb-10 border-y border-border bg-card px-5 py-4 lg:hidden">
            <summary className="cursor-pointer list-none font-heading font-semibold marker:hidden">
              {navigationLabel}
            </summary>
            <DocumentNavigation
              label={navigationLabel}
              navigation={navigation}
            />
          </details>

          <div className="grid gap-14 lg:grid-cols-[16rem_minmax(0,47rem)] lg:justify-between lg:gap-20 xl:grid-cols-[17rem_minmax(0,49rem)]">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
                  {navigationLabel}
                </p>
                <DocumentNavigation
                  label={navigationLabel}
                  navigation={navigation}
                />
                <div className="mt-8 border-t border-border pt-6">
                  <Mail className="size-4 text-primary" />
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Dúvidas sobre este documento?
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-2 block break-all text-xs font-semibold text-foreground hover:text-primary"
                  >
                    {email}
                  </a>
                </div>
              </div>
            </aside>

            <div>
              <div className="legal-copy">{children}</div>

              <section className="mt-16 border-y border-border py-8 sm:py-10">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
                  {counterpart.label}
                </p>
                <div className="mt-4 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <h2 className="font-heading text-2xl font-semibold">
                      {counterpart.title}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                      {counterpart.description}
                    </p>
                  </div>
                  <Link
                    href={counterpart.href}
                    className="inline-flex min-h-11 items-center justify-between gap-6 bg-primary px-4 text-sm font-semibold text-primary-foreground"
                  >
                    Ler documento
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </section>

              <Link
                href="/"
                className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                Voltar para a página inicial
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </article>

        <section className="border-t border-border bg-card py-8">
          <div className="container-page flex items-center gap-3 text-xs text-muted-foreground">
            <FileText className="size-4 text-primary" />
            Consulte sempre a versão vigente publicada nesta página.
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
