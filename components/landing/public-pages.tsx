import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CircleDollarSign,
  HelpCircle,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

import { faqs, pipeline, plans } from './content'

const publicRoutes: {
  id: string
  label: string
  title: string
  description: string
  detail: string
  href: string
  icon: LucideIcon
}[] = [
  {
    id: 'como-funciona',
    label: 'Fluxo do produto',
    title: 'Como funciona',
    description: 'Acompanhe a ordem do planejamento ao faturamento.',
    detail: '4 etapas conectadas',
    href: '/como-funciona',
    icon: CalendarCheck2,
  },
  {
    id: 'para-quem',
    label: 'Aderência',
    title: 'Para quem',
    description: 'Entenda onde a Ciclera se encaixa melhor.',
    detail: 'Operações B2B externas',
    href: '/para-quem',
    icon: Building2,
  },
  {
    id: 'planos',
    label: 'Investimento',
    title: 'Planos',
    description: 'Compare capacidade, acessos e armazenamento.',
    detail: 'A partir de R$ 199/mês',
    href: '/planos',
    icon: CircleDollarSign,
  },
  {
    id: 'duvidas',
    label: 'Respostas',
    title: 'Dúvidas',
    description: 'Respostas diretas antes de escolher a plataforma.',
    detail: `${faqs.length} respostas essenciais`,
    href: '/duvidas',
    icon: HelpCircle,
  },
]

export function HomeExploreSection() {
  return (
    <section id="explorar" className="bg-card py-14 sm:py-16 lg:py-20">
      <div className="container-page">
        <div className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[1.25fr_.75fr] lg:items-start lg:gap-12 lg:pb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
              Explore com profundidade
            </p>
            <h2 className="mt-4 max-w-3xl text-balance font-heading text-[clamp(2.25rem,3.2vw,3.15rem)] font-semibold leading-[1.08] tracking-[-.035em]">
              Encontre a informação certa sem atravessar uma página infinita.
            </h2>
          </div>
          <p className="max-w-lg border-l border-primary pl-5 leading-7 text-muted-foreground lg:mt-7 lg:justify-self-end">
            O essencial continua aqui. Os detalhes de funcionamento, aderência,
            preços e decisão agora vivem em páginas próprias.
          </p>
        </div>

        <div className="mt-8 grid border-l border-t border-border md:grid-cols-2 lg:grid-cols-4">
          {publicRoutes.map(
            ({ id, label, title, description, detail, href, icon: Icon }) => (
              <article
                id={id}
                key={href}
                className="group relative flex min-h-0 flex-col overflow-hidden border-b border-r border-border bg-background p-5 transition-colors before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:origin-left before:scale-x-0 before:bg-primary before:transition-transform before:duration-300 hover:bg-muted/40 hover:before:scale-x-100 sm:min-h-56 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
                    {label}
                  </span>
                  <span className="grid size-9 place-items-center border border-border bg-card text-primary">
                    <Icon className="size-4" />
                  </span>
                </div>
                <h3 className="mt-8 font-heading text-xl font-semibold sm:text-2xl">
                  {title}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
                <Link
                  href={href}
                  className="mt-7 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold text-primary after:absolute after:inset-0 sm:mt-auto sm:pt-5"
                >
                  {detail}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

export function HowItWorksHero() {
  const flowAreas = ['Planejamento', 'Campo', 'Conferência', 'Receita'] as const

  return (
    <section className="overflow-hidden bg-institutional text-primary-foreground">
      <div className="container-page py-16 sm:py-20 lg:py-24">
        <PublicBreadcrumb current="Como funciona" dark />
        <div className="mt-12 grid gap-12 lg:grid-cols-[.88fr_1.12fr] lg:items-stretch">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary-foreground">
              Um fluxo, não uma coleção de telas
            </p>
            <h1 className="mt-5 max-w-3xl text-balance font-heading text-[clamp(2.7rem,5vw,5.2rem)] font-semibold leading-[1.01] tracking-[-.05em]">
              Cada registro prepara a próxima decisão.
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-primary-foreground/68">
              Planejamento, campo, revisão e faturamento compartilham a mesma
              ordem e o mesmo histórico.
            </p>
          </div>
          <div className="self-end border border-primary-foreground/14 bg-primary-foreground/[.035]">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-primary-foreground/14 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-active">
                  A mesma ordem avança
                </p>
                <p className="mt-1 text-sm text-primary-foreground/62">
                  Sem perder contexto entre as equipes.
                </p>
              </div>
              <span className="border border-primary-foreground/16 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-primary-foreground/70">
                4 decisões conectadas
              </span>
            </div>
            <ol aria-label="Resumo do fluxo da ordem">
              {pipeline.slice(1).map(([title, description], index) => (
                <li
                  key={title}
                  className="grid gap-3 border-b border-primary-foreground/12 px-5 py-5 last:border-b-0 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center sm:px-6"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[.15em] text-active">
                    {flowAreas[index]}
                  </p>
                  <div className="sm:border-l sm:border-primary-foreground/14 sm:pl-5">
                    <p className="font-heading text-lg font-semibold">
                      {title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-primary-foreground/55">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AudienceHero() {
  const fitSignals = [
    ['Equipe em campo', 'O trabalho acontece nos locais dos clientes.'],
    ['Ativos atendidos', 'Equipamentos e unidades precisam manter contexto.'],
    [
      'Retorno ao escritório',
      'A ordem deve voltar completa ao administrativo.',
    ],
  ] as const

  return (
    <section className="bg-background">
      <div className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-stretch lg:py-24">
        <div>
          <PublicBreadcrumb current="Para quem" />
          <p className="mt-12 text-xs font-bold uppercase tracking-[.2em] text-primary">
            Aderência operacional
          </p>
          <h1 className="mt-5 max-w-3xl text-balance font-heading text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[1.02] tracking-[-.05em]">
            Para quem executa fora e administra de dentro.
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
            Empresas B2B com equipe técnica, ativos atendidos e ordens que
            precisam voltar completas ao escritório.
          </p>
        </div>
        <aside
          aria-label="Perfil de operação atendido"
          className="flex flex-col bg-institutional p-6 text-primary-foreground sm:p-8 lg:mt-12"
        >
          <p className="text-[10px] font-bold uppercase tracking-[.17em] text-active">
            Bom encaixe operacional
          </p>
          <p className="mt-4 max-w-md font-heading text-2xl font-semibold leading-tight sm:text-3xl">
            Três sinais de que a operação precisa de uma linha única.
          </p>
          <dl className="mt-8 border-t border-primary-foreground/15">
            {fitSignals.map(([term, description]) => (
              <div
                key={term}
                className="grid gap-1 border-b border-primary-foreground/15 py-4 sm:grid-cols-[8rem_1fr] sm:gap-5"
              >
                <dt className="text-xs font-semibold text-primary-foreground">
                  {term}
                </dt>
                <dd className="text-xs leading-5 text-primary-foreground/58">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-auto border-t border-active/25 pt-5 text-xs font-semibold text-active">
            Melhor aderência: operações B2B com 5–30 técnicos externos.
          </p>
        </aside>
      </div>
    </section>
  )
}

export function PricingHero() {
  return (
    <section className="border-b border-border bg-card text-foreground">
      <div className="container-page py-16 sm:py-20 lg:py-24">
        <PublicBreadcrumb current="Planos" />
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,.58fr)] lg:items-stretch">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
              Preço previsível
            </p>
            <h1 className="mt-5 max-w-4xl text-balance font-heading text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[1.02] tracking-[-.05em]">
              O mesmo fluxo. A capacidade certa para cada equipe.
            </h1>
          </div>
          <aside className="flex flex-col justify-between border border-border bg-institutional p-6 text-primary-foreground sm:p-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.17em] text-active">
                Entrada na Ciclera
              </p>
              <p className="mt-5 text-sm text-primary-foreground/58">
                A partir de
              </p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
                <span className="font-heading text-5xl font-semibold tracking-[-.05em] sm:text-6xl">
                  R$ {plans[0].price}
                </span>
                <span className="text-sm text-primary-foreground/60">
                  por mês
                </span>
              </p>
              <p className="mt-5 max-w-sm text-sm leading-6 text-primary-foreground/65">
                O fluxo operacional completo está em todos os planos. A
                capacidade muda conforme sua equipe cresce.
              </p>
            </div>
            <Link
              href="#planos"
              className="mt-8 flex items-center justify-between border-t border-primary-foreground/15 pt-4 text-sm font-semibold text-active"
            >
              Comparar capacidades <ArrowRight className="size-4" />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function QuestionsHero() {
  const questionTopics = [
    'Produto e operação',
    'Planos e cobrança',
    'Acesso e segurança',
  ] as const

  return (
    <section className="border-b border-border bg-card">
      <div className="container-page py-16 sm:py-20 lg:py-24">
        <PublicBreadcrumb current="Dúvidas" />
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.08fr_.62fr] lg:items-stretch">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
              Central de respostas
            </p>
            <h1 className="mt-5 max-w-4xl text-balance font-heading text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[1.02] tracking-[-.05em]">
              Decida com clareza antes de criar sua operação.
            </h1>
          </div>
          <aside className="border border-border bg-background p-6 sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">
              Nesta página
            </p>
            <p className="mt-4 font-heading text-2xl font-semibold leading-tight">
              Respostas para decidir sem surpresa.
            </p>
            <ul
              aria-label="Assuntos respondidos"
              className="mt-6 border-t border-border"
            >
              {questionTopics.map((topic) => (
                <li
                  key={topic}
                  className="border-b border-border py-3 text-sm font-medium"
                >
                  {topic}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted-foreground">
              {faqs.length} perguntas essenciais, em linguagem direta.
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function PublicPageCta({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="bg-background pb-6 sm:pb-10">
      <div className="container-page">
        <div className="landing-blueprint bg-institutional px-6 py-12 text-primary-foreground sm:px-10 lg:px-16 lg:py-16">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <ShieldCheck className="size-6 text-active" />
              <h2 className="mt-6 max-w-3xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                {title}
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-primary-foreground/65">
                {description}
              </p>
            </div>
            <Link
              href="/registro"
              className="inline-flex min-h-13 items-center justify-between gap-8 bg-active px-6 font-semibold text-institutional"
            >
              Criar minha conta <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PlanAssurances() {
  const assurances = [
    [
      'Ativação',
      'Após o pagamento',
      'Sem período de teste',
      'A operação é liberada após a confirmação do pagamento.',
    ],
    [
      'Ciclo',
      'Mensal',
      'Cobrança mensal',
      'O plano acompanha a capacidade contratada pela organização.',
    ],
    [
      'Continuidade',
      'Preservada',
      'Dados preservados',
      'Cancelamento interrompe a renovação sem apagar os registros operacionais.',
    ],
  ] as const

  return (
    <section className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <div className="grid gap-7 border-b border-border pb-8 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
              Antes de contratar
            </p>
            <h2 className="mt-4 max-w-3xl text-balance font-heading text-[clamp(2rem,3.6vw,3.35rem)] font-semibold leading-[1.08] tracking-[-.035em]">
              Condições claras desde o primeiro pagamento.
            </h2>
          </div>
          <p className="max-w-lg leading-7 text-muted-foreground lg:justify-self-end">
            Sem fidelidade escondida, período promocional ou perda dos registros
            operacionais ao interromper a renovação.
          </p>
        </div>
        <ul
          aria-label="Condições da assinatura"
          className="mt-8 grid border-l border-t border-border md:grid-cols-3"
        >
          {assurances.map(([label, state, title, text], index) => (
            <li
              key={title}
              className={
                index === assurances.length - 1
                  ? 'border-b border-r border-primary bg-institutional text-primary-foreground'
                  : 'border-b border-r border-border bg-card'
              }
            >
              <article className="flex min-h-60 flex-col p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p
                    className={
                      index === assurances.length - 1
                        ? 'text-[10px] font-bold uppercase tracking-[.16em] text-active'
                        : 'text-[10px] font-bold uppercase tracking-[.16em] text-primary'
                    }
                  >
                    {label}
                  </p>
                  <span
                    className={
                      index === assurances.length - 1
                        ? 'border border-active/30 bg-active/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-active'
                        : 'border border-primary/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-primary'
                    }
                  >
                    {state}
                  </span>
                </div>
                <h3 className="mt-10 font-heading text-xl font-semibold">
                  {title}
                </h3>
                <p
                  className={
                    index === assurances.length - 1
                      ? 'mt-3 text-sm leading-6 text-primary-foreground/65'
                      : 'mt-3 text-sm leading-6 text-muted-foreground'
                  }
                >
                  {text}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function PublicBreadcrumb({
  current,
  dark = false,
}: {
  current: string
  dark?: boolean
}) {
  return (
    <nav aria-label="Navegação estrutural" className="text-xs">
      <ol
        className={
          dark
            ? 'flex gap-2 text-primary-foreground/80'
            : 'flex gap-2 text-muted-foreground'
        }
      >
        <li>
          <Link
            href="/"
            className={
              dark ? 'hover:text-primary-foreground' : 'hover:text-foreground'
            }
          >
            Início
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className={dark ? 'text-primary-foreground' : 'text-primary'}>
          {current}
        </li>
      </ol>
    </nav>
  )
}
