import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  FileCheck2,
  MapPin,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Footer } from '@/components/landing/footer'
import { Header } from '@/components/landing/header'
import { cn } from '@/lib/utils'

type ProductPageKey = 'operations' | 'field' | 'review'

type ProductChapter = {
  eyebrow: string
  title: string
  description: string
  items: readonly string[]
}

export type ProductPageData = {
  key: ProductPageKey
  eyebrow: string
  title: string
  description: string
  promise: string
  highlights: readonly [string, string][]
  chapters: readonly ProductChapter[]
  steps: readonly [string, string][]
}

export const productPages: Record<ProductPageKey, ProductPageData> = {
  operations: {
    key: 'operations',
    eyebrow: 'Gestão operacional',
    title: 'Planeje o trabalho sem perder o contexto.',
    description:
      'Clientes, locais, equipamentos, equipe, ordens e agenda permanecem conectados para o escritório saber o que precisa acontecer, onde e com quem.',
    promise:
      'Uma base operacional única antes de o técnico sair para o atendimento.',
    highlights: [
      ['Cadastros conectados', 'Cliente, local e equipamento na mesma ordem'],
      ['Agenda responsável', 'Data, horário e técnico claramente definidos'],
      ['Acesso por perfil', 'Proprietário, administrador e técnico'],
    ],
    chapters: [
      {
        eyebrow: 'Estrutura',
        title: 'O histórico começa antes da primeira ordem.',
        description:
          'A operação ganha uma estrutura consistente para que o atendimento não dependa de dados soltos em mensagens ou planilhas.',
        items: [
          'Clientes, unidades e contatos operacionais',
          'Equipamentos com identificação e histórico técnico',
          'Importação inicial de clientes, locais e equipamentos por CSV',
        ],
      },
      {
        eyebrow: 'Planejamento',
        title: 'Cada ordem nasce pronta para ser distribuída.',
        description:
          'Prioridade, período previsto, tipo de serviço, equipamento e valor acompanham a ordem desde o rascunho.',
        items: [
          'Agenda, atribuição e reagendamento',
          'Reatribuição com histórico preservado',
          'Controle de versão para evitar sobrescritas silenciosas',
        ],
      },
    ],
    steps: [
      [
        'Cadastre a operação',
        'Organize clientes, unidades, equipamentos e equipe.',
      ],
      ['Abra a ordem', 'Defina escopo, prioridade, período e valor previsto.'],
      ['Agende o atendimento', 'Escolha o técnico e acompanhe a agenda.'],
      [
        'Acompanhe o avanço',
        'Veja o estado real sem cobrar atualização por mensagem.',
      ],
    ],
  },
  field: {
    key: 'field',
    eyebrow: 'Execução em campo',
    title: 'O técnico vê o necessário e registra o que aconteceu.',
    description:
      'Uma experiência web responsiva, direta e concentrada nas ordens atribuídas a cada técnico — do início controlado ao envio para revisão.',
    promise:
      'Menos etapas paralelas para executar, documentar e devolver a ordem completa.',
    highlights: [
      [
        'Agenda individual',
        'Somente os atendimentos atribuídos, com horário e contexto do serviço',
      ],
      [
        'Registro no mesmo fluxo',
        'Diagnóstico, fotos privadas e adicionais confirmados pelo servidor',
      ],
      [
        'Execução protegida',
        'Conflitos e ações repetidas tratados antes do envio à revisão',
      ],
    ],
    chapters: [
      {
        eyebrow: 'Ao chegar no local',
        title: 'Contexto pronto para começar.',
        description:
          'O técnico consulta cliente, endereço, equipamento, horário e instruções sem navegar pela área administrativa.',
        items: [
          'Início controlado da execução',
          'Diagnóstico e observações do trabalho',
          'Cliente, local, equipamento e instruções sempre visíveis',
        ],
      },
      {
        eyebrow: 'Antes de devolver a ordem',
        title: 'Registro pronto para revisão.',
        description:
          'Fotos e adicionais seguem vinculados à ordem para que a revisão aconteça com contexto e rastreabilidade.',
        items: [
          'Captura de fotos pela câmera ou seleção da galeria',
          'Materiais, serviços e horas adicionais em centavos',
          'Fluxo de correção quando o administrativo solicita ajuste',
        ],
      },
    ],
    steps: [
      [
        'Consulte a agenda',
        'Veja os serviços de hoje, próximos e em execução.',
      ],
      ['Inicie com segurança', 'Confirme o início e registre a execução real.'],
      [
        'Documente o serviço',
        'Adicione diagnóstico, fotos e itens adicionais.',
      ],
      [
        'Envie para revisão',
        'A ordem segue bloqueada até a decisão administrativa.',
      ],
    ],
  },
  review: {
    key: 'review',
    eyebrow: 'Revisão e faturamento',
    title: 'Aprove com evidência antes de liberar a receita.',
    description:
      'O administrativo confere execução, fotos e adicionais, solicita correções quando necessário e organiza o que já está pronto para faturar.',
    promise:
      'Uma passagem clara entre serviço concluído e valor liberado para cobrança.',
    highlights: [
      ['Revisão acionável', 'Aprovar ou devolver com um motivo claro'],
      [
        'Valor preservado',
        'Cálculos oficiais em centavos e snapshot histórico',
      ],
      ['Saída administrativa', 'PDF com evidências e exportação CSV'],
    ],
    chapters: [
      {
        eyebrow: 'Conferência',
        title: 'A conclusão do técnico não encerra a verificação.',
        description:
          'A fila de revisão reúne tudo que o escritório precisa para decidir sem reconstruir o atendimento.',
        items: [
          'Observações, fotos e itens adicionais na mesma análise',
          'Aprovação ou solicitação de correção com motivo',
          'Histórico e auditoria preservados em cada transição',
        ],
      },
      {
        eyebrow: 'Receita liberada',
        title: 'O financeiro recebe uma fila, não uma investigação.',
        description:
          'Ordens aprovadas ficam disponíveis para acompanhamento administrativo com valor final e documentos de apoio.',
        items: [
          'Fila de serviços prontos para faturar',
          'Relatório PDF com as evidências disponíveis',
          'Filtros, exportação CSV e marcação manual como faturada',
        ],
      },
    ],
    steps: [
      ['Receba a execução', 'A ordem entra na fila com o registro do campo.'],
      ['Confira a entrega', 'Analise observações, fotos, itens e valor.'],
      ['Decida com clareza', 'Aprove ou devolva ao técnico com orientação.'],
      [
        'Acompanhe a cobrança',
        'Organize o que está pronto e marque o que foi faturado.',
      ],
    ],
  },
}

const relatedPages = [
  {
    key: 'operations' as const,
    title: 'Gestão operacional',
    description: 'Estruture cadastros, ordens, equipe e agenda.',
    href: '/produto/gestao-operacional',
  },
  {
    key: 'field' as const,
    title: 'Execução em campo',
    description: 'Veja a experiência direta de quem executa o atendimento.',
    href: '/produto/execucao-em-campo',
  },
  {
    key: 'review' as const,
    title: 'Revisão e faturamento',
    description: 'Entenda como a entrega é conferida e libera a receita.',
    href: '/produto/revisao-e-faturamento',
  },
] as const

const operationsHighlightLabels = [
  'Base única',
  'Agenda coordenada',
  'Permissões claras',
] as const

const operationsFlowLabels = [
  'Base preparada',
  'Ordem estruturada',
  'Agenda confirmada',
  'Operação visível',
] as const

const fieldHighlightLabels = [
  'Antes de sair',
  'Durante o atendimento',
  'Ao devolver',
] as const

const fieldFlowLabels = ['Agenda', 'Chegada', 'Registro', 'Entrega'] as const

const reviewHighlightLabels = [
  'Decisão orientada',
  'Valor auditável',
  'Saída documentada',
] as const

const reviewHighlightStates = ['Conferido', 'Preservado', 'Disponível'] as const

const reviewChapterStatuses = [
  ['Recebido', 'Conferível', 'Preservado'],
  ['Organizada', 'Disponível', 'Acompanhável'],
] as const

const reviewFlowLabels = [
  'Execução recebida',
  'Conferência administrativa',
  'Decisão registrada',
  'Receita liberada',
] as const

function OperationsPreview() {
  return (
    <div className="product-preview-window">
      <div className="flex items-center justify-between border-b border-primary-foreground/12 px-5 py-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.16em] text-active">
            Visão operacional
          </p>
          <p className="mt-1 text-sm font-semibold">Agosto de 2026</p>
        </div>
        <span className="bg-active/12 px-2.5 py-1 text-[9px] font-semibold text-active">
          12 ordens
        </span>
      </div>
      <div className="grid grid-cols-3 gap-px bg-primary-foreground/10">
        {[
          ['Em execução', '3'],
          ['Revisão', '2'],
          ['Prontas', '4'],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={cn(
              'bg-institutional p-4',
              index === 2 && 'bg-primary text-primary-foreground',
            )}
          >
            <p className="text-[9px] text-primary-foreground/55">{label}</p>
            <p className="mt-2 font-heading text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="p-5">
        <div className="border border-primary-foreground/12 bg-primary-foreground/[.04] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold tracking-[.14em] text-active">
                OS-000184
              </p>
              <p className="mt-2 text-sm font-semibold leading-snug">
                Manutenção preventiva do ar-condicionado
              </p>
            </div>
            <span className="shrink-0 bg-active/15 px-2 py-1 text-[8px] font-bold text-active">
              Agendada
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-primary-foreground/10 pt-4 text-[9px] text-primary-foreground/60">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-active" /> 20 ago. · 09:00
            </span>
            <span className="flex items-center justify-end gap-1.5">
              <UsersRound className="size-3.5 text-active" /> Juarez Silva
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldPreview() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto max-w-[23rem] border-[5px] border-primary-foreground/12 bg-card p-2 text-foreground shadow-[0_30px_70px_rgba(0,0,0,.22)]"
    >
      <div className="border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-[9px] font-bold uppercase tracking-[.16em] text-primary">
            Área de campo
          </span>
          <span className="text-[9px] text-muted-foreground">Hoje</span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold tracking-[.14em] text-primary">
                OS-000184
              </p>
              <p className="mt-2 font-heading text-base font-semibold leading-snug">
                Manutenção preventiva do ar-condicionado
              </p>
            </div>
            <span className="bg-primary px-2 py-1 text-[8px] font-bold text-primary-foreground">
              Agendada
            </span>
          </div>
          <div className="mt-5 space-y-3 border-y border-border py-4 text-[10px]">
            <p className="flex items-center gap-2">
              <MapPin className="size-3.5 text-primary" /> Hotel Serra Verde ·
              Unidade Centro
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="size-3.5 text-primary" /> 09:00 — 12:00
            </p>
          </div>
          <div className="mt-4 flex min-h-11 items-center justify-between bg-primary px-4 text-[10px] font-semibold text-primary-foreground">
            Ver atendimento <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewPreview() {
  return (
    <div aria-hidden="true" className="product-preview-window">
      <div className="flex items-center justify-between border-b border-primary-foreground/12 px-5 py-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.16em] text-active">
            Conferência operacional
          </p>
          <p className="mt-1 text-sm font-semibold">Aguardando revisão</p>
        </div>
        <span className="font-heading text-2xl font-semibold">2</span>
      </div>
      <div className="p-5">
        <div className="border border-primary-foreground/12 bg-primary-foreground/[.04] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold tracking-[.14em] text-active">
                OS-000184
              </p>
              <p className="mt-2 text-sm font-semibold leading-snug">
                Manutenção preventiva concluída
              </p>
            </div>
            <FileCheck2 className="size-5 text-active" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-px bg-primary-foreground/10 text-center">
            {[
              ['Fotos', '3'],
              ['Adicionais', '2'],
              ['Total', 'R$ 1.625'],
            ].map(([label, value]) => (
              <div key={label} className="bg-institutional px-2 py-3">
                <p className="text-[8px] text-primary-foreground/50">{label}</p>
                <p className="mt-1 text-[10px] font-semibold">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex min-h-10 items-center justify-between bg-active px-3 text-[9px] font-bold text-institutional">
            Aprovar execução <Check className="size-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductPreview({ pageKey }: { pageKey: ProductPageKey }) {
  if (pageKey === 'operations') return <OperationsPreview />
  if (pageKey === 'field') return <FieldPreview />
  return <ReviewPreview />
}

function ProductHeroCopy({
  data,
  dark = true,
}: {
  data: ProductPageData
  dark?: boolean
}) {
  return (
    <div>
      <nav aria-label="Navegação estrutural" className="text-xs">
        <ol
          className={cn(
            'flex items-center gap-2',
            dark ? 'text-primary-foreground/75' : 'text-muted-foreground',
          )}
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
          <li>Produto</li>
          <li aria-hidden="true">/</li>
          <li
            aria-current="page"
            className={dark ? 'text-active' : 'text-primary'}
          >
            {data.eyebrow}
          </li>
        </ol>
      </nav>
      <p
        className={cn(
          'mt-12 text-xs font-bold uppercase tracking-[.2em]',
          dark ? 'text-active' : 'text-primary',
        )}
      >
        {data.eyebrow}
      </p>
      <h1 className="mt-5 max-w-3xl text-balance font-heading text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-[1.02] tracking-[-.045em]">
        {data.title}
      </h1>
      <p
        className={cn(
          'mt-7 max-w-xl text-pretty text-base leading-8 sm:text-lg',
          dark ? 'text-primary-foreground/68' : 'text-muted-foreground',
        )}
      >
        {data.description}
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/registro"
          className={cn(
            'inline-flex min-h-13 items-center justify-between gap-8 px-6 font-semibold transition-colors',
            dark
              ? 'bg-active text-institutional hover:bg-accent'
              : 'bg-primary text-primary-foreground hover:bg-institutional',
          )}
        >
          Criar minha conta
          <ArrowUpRight className="size-4" />
        </Link>
        <Link
          href="/planos"
          className={cn(
            'inline-flex min-h-13 items-center justify-start border px-6 font-semibold',
            dark
              ? 'border-primary-foreground/20 hover:border-primary-foreground/40'
              : 'border-border bg-card hover:border-primary/40',
          )}
        >
          Ver planos
        </Link>
      </div>
    </div>
  )
}

function ProductHero({ data }: { data: ProductPageData }) {
  if (data.key === 'field') {
    return (
      <section className="overflow-hidden bg-institutional text-primary-foreground">
        <div className="container-page grid gap-0 py-10 sm:py-14 lg:grid-cols-[.88fr_1.12fr] lg:py-16">
          <div className="flex items-center py-8 lg:pr-16">
            <ProductHeroCopy data={data} />
          </div>
          <div className="relative min-h-[34rem] overflow-hidden border border-primary-foreground/12 sm:min-h-[42rem]">
            <Image
              src="/field-technician-ciclera.png"
              alt="Técnico usando a Ciclera durante um atendimento em campo"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-institutional via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-7 sm:left-7 sm:w-[22rem]">
              <FieldPreview />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (data.key === 'review') {
    return (
      <section className="overflow-hidden border-b border-border bg-card text-foreground">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-24">
          <ProductHeroCopy data={data} dark={false} />
          <div className="relative bg-institutional p-5 text-primary-foreground sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 bg-active px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-institutional">
              Receita conferida
            </div>
            <p className="mb-6 mt-8 text-[10px] font-bold uppercase tracking-[.17em] text-active">
              Mesa de conferência
            </p>
            <ReviewPreview />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden bg-institutional text-primary-foreground">
      <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:py-28">
        <ProductHeroCopy data={data} />
        <div className="landing-blueprint border border-primary-foreground/12 bg-primary-foreground/[.035] p-4 sm:p-7 lg:p-9">
          <ProductPreview pageKey={data.key} />
        </div>
      </div>
    </section>
  )
}

function ProductChapters({ data }: { data: ProductPageData }) {
  if (data.key === 'field') {
    return (
      <section className="section-shell bg-card">
        <div className="container-page">
          <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1.08fr_.72fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
                Na rotina do técnico
              </p>
              <h2 className="mt-5 max-w-3xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                {data.promise}
              </h2>
            </div>
            <p className="max-w-xl border-l border-primary pl-5 leading-7 text-muted-foreground">
              Leitura rápida para chegar preparado. Registro direto para
              devolver a ordem completa ao escritório.
            </p>
          </div>

          <ol
            aria-label="Momentos da execução em campo"
            className="mt-10 space-y-6"
          >
            {data.chapters.map(
              ({ eyebrow, title, description, items }, index) => (
                <li
                  key={title}
                  className="overflow-hidden border border-border bg-background"
                >
                  <article className="grid lg:grid-cols-[.82fr_1.18fr]">
                    <div
                      className={cn(
                        'p-6 sm:p-8 lg:p-10',
                        index === 1 && 'lg:order-2',
                      )}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
                        {eyebrow}
                      </p>
                      <h3 className="mt-5 max-w-xl font-heading text-2xl font-semibold leading-tight sm:text-3xl">
                        {title}
                      </h3>
                      <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
                        {description}
                      </p>
                    </div>

                    <div
                      className={cn(
                        'border-t p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10',
                        index === 0
                          ? 'border-border bg-muted/35'
                          : 'border-institutional bg-institutional text-primary-foreground lg:order-1 lg:border-l-0 lg:border-r',
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p
                          className={cn(
                            'text-[10px] font-bold uppercase tracking-[.17em]',
                            index === 0 ? 'text-primary' : 'text-active',
                          )}
                        >
                          {index === 0
                            ? 'Na tela do técnico'
                            : 'Registro vinculado à ordem'}
                        </p>
                        <span
                          className={cn(
                            'px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em]',
                            index === 0
                              ? 'bg-primary/8 text-primary'
                              : 'bg-active text-institutional',
                          )}
                        >
                          {index === 0
                            ? 'Pronto para iniciar'
                            : 'Pronto para revisão'}
                        </span>
                      </div>
                      <ul className="mt-8">
                        {items.map((item) => (
                          <li
                            key={item}
                            className={cn(
                              'grid grid-cols-[1.5rem_1fr] gap-3 border-t py-4 text-sm leading-6 first:pt-4',
                              index === 0
                                ? 'border-border'
                                : 'border-primary-foreground/15',
                            )}
                          >
                            <span
                              className={cn(
                                'mt-3 block h-px w-5',
                                index === 0 ? 'bg-primary' : 'bg-active',
                              )}
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </li>
              ),
            )}
          </ol>
        </div>
      </section>
    )
  }

  if (data.key === 'review') {
    return (
      <section
        aria-labelledby="review-decision-title"
        className="section-shell bg-background"
      >
        <div className="container-page">
          <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1.08fr_.72fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
                Da conferência à receita
              </p>
              <h2
                id="review-decision-title"
                className="mt-5 max-w-3xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl"
              >
                {data.promise}
              </h2>
            </div>
            <p className="max-w-xl border-l border-primary pl-5 leading-7 text-muted-foreground">
              A Ciclera organiza a decisão administrativa e preserva o que foi
              aprovado, sem se apresentar como sistema fiscal ou bancário.
            </p>
          </div>
          <ol
            aria-label="Momentos da revisão administrativa"
            className="mt-10 grid border-l border-t border-border lg:grid-cols-[1.08fr_.92fr]"
          >
            {data.chapters.map(
              ({ eyebrow, title, description, items }, chapterIndex) => (
                <li
                  key={title}
                  className={cn(
                    'border-b border-r border-border',
                    chapterIndex === 0
                      ? 'bg-card'
                      : 'border-institutional bg-institutional text-primary-foreground',
                  )}
                >
                  <article className="flex h-full flex-col p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p
                        className={cn(
                          'text-[10px] font-bold uppercase tracking-[.18em]',
                          chapterIndex === 0 ? 'text-primary' : 'text-active',
                        )}
                      >
                        {chapterIndex === 0
                          ? 'Entrada para decisão'
                          : 'Saída após aprovação'}
                      </p>
                      <span
                        className={cn(
                          'px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em]',
                          chapterIndex === 0
                            ? 'bg-primary/8 text-primary'
                            : 'bg-active text-institutional',
                        )}
                      >
                        {chapterIndex === 0
                          ? 'Execução recebida'
                          : 'Pronta para faturar'}
                      </span>
                    </div>

                    <p
                      className={cn(
                        'mt-10 text-[10px] font-bold uppercase tracking-[.17em]',
                        chapterIndex === 0 ? 'text-primary' : 'text-active',
                      )}
                    >
                      {eyebrow}
                    </p>
                    <h3 className="mt-4 max-w-xl font-heading text-2xl font-semibold leading-tight sm:text-3xl">
                      {title}
                    </h3>
                    <p
                      className={cn(
                        'mt-5 max-w-xl leading-7',
                        chapterIndex === 0
                          ? 'text-muted-foreground'
                          : 'text-primary-foreground/65',
                      )}
                    >
                      {description}
                    </p>

                    <ul className="mt-8">
                      {items.map((item, itemIndex) => (
                        <li
                          key={item}
                          className={cn(
                            'grid grid-cols-[1fr_auto] items-start gap-4 border-t py-4 text-sm leading-6',
                            chapterIndex === 0
                              ? 'border-border'
                              : 'border-primary-foreground/15',
                          )}
                        >
                          <span>{item}</span>
                          <span
                            className={cn(
                              'whitespace-nowrap text-[9px] font-bold uppercase tracking-[.12em]',
                              chapterIndex === 0
                                ? 'text-primary'
                                : 'text-active',
                            )}
                          >
                            {reviewChapterStatuses[chapterIndex][itemIndex]}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ),
            )}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <section className="section-shell bg-background">
      <div className="container-page">
        <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
              Na prática
            </p>
            <h2 className="mt-5 max-w-2xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              {data.promise}
            </h2>
          </div>
          <p className="max-w-xl border-l border-primary pl-5 leading-7 text-muted-foreground">
            Estrutura e planejamento compartilham o mesmo contexto para que a
            operação avance sem depender de controles paralelos.
          </p>
        </div>

        <div className="mt-10 border-l border-t border-border">
          {data.chapters.map(
            ({ eyebrow, title, description, items }, index) => (
              <article
                key={title}
                className={cn(
                  'grid border-b border-r border-border lg:grid-cols-[.82fr_1.18fr]',
                  index === 0 ? 'bg-card' : 'bg-muted/25',
                )}
              >
                <div className="border-b border-border p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">
                    {eyebrow}
                  </p>
                  <h3 className="mt-5 max-w-xl font-heading text-2xl font-semibold leading-tight sm:text-3xl">
                    {title}
                  </h3>
                </div>
                <div className="p-6 sm:p-8 lg:p-10">
                  <p className="max-w-2xl leading-7 text-muted-foreground">
                    {description}
                  </p>
                  <ul className="mt-7 grid gap-4 sm:grid-cols-3">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="border-t border-border pt-4 text-sm leading-6"
                      >
                        <span
                          className="mb-3 block h-px w-6 bg-primary"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

function ProductFlow({ data }: { data: ProductPageData }) {
  if (data.key === 'operations') {
    return (
      <section className="bg-card py-20 sm:py-24 lg:py-28">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
                Fluxo de trabalho
              </p>
              <h2 className="mt-5 max-w-2xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                Da base organizada à operação visível.
              </h2>
            </div>
            <p className="max-w-xl border-l border-primary pl-5 leading-7 text-muted-foreground">
              Cada passagem preserva o contexto da ordem e deixa claro o que já
              foi definido e o que precisa acontecer em seguida.
            </p>
          </div>

          <ol className="mt-12 grid border-l border-t border-border md:grid-cols-2 lg:grid-cols-4">
            {data.steps.map(([title, description], index) => (
              <li
                key={title}
                className="relative min-h-52 border-b border-r border-border bg-background p-6 sm:p-7"
              >
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-primary">
                  {operationsFlowLabels[index]}
                </p>
                <h3 className="mt-10 font-heading text-xl font-semibold leading-snug">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
                {index < data.steps.length - 1 ? (
                  <span
                    className="absolute -right-4 top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center border border-border bg-card text-primary lg:grid"
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-3.5" />
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  if (data.key === 'field') {
    return (
      <section className="bg-background py-20 sm:py-24 lg:py-28">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
                Jornada do atendimento
              </p>
              <h2 className="mt-5 max-w-2xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                Da agenda à revisão, sem sair da ordem.
              </h2>
            </div>
            <p className="max-w-xl border-l border-primary pl-5 leading-7 text-muted-foreground">
              Cada momento mantém o contexto recebido e prepara o próximo, sem
              exigir controles paralelos durante o serviço.
            </p>
          </div>

          <ol
            aria-label="Etapas da execução em campo"
            className="mt-12 border-l border-border lg:grid lg:grid-cols-4 lg:border-l-0 lg:border-t"
          >
            {data.steps.map(([title, description], index) => (
              <li
                key={title}
                className="relative pb-9 pl-8 last:pb-0 lg:min-h-44 lg:pb-0 lg:pl-0 lg:pr-8 lg:pt-9"
              >
                <span
                  className={cn(
                    'absolute -left-[5px] top-1 size-2.5 rounded-full ring-4 ring-background lg:-top-[5px] lg:left-0',
                    index === data.steps.length - 1
                      ? 'bg-active'
                      : 'bg-primary',
                  )}
                  aria-hidden="true"
                />
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-primary">
                  {fieldFlowLabels[index]}
                </p>
                <h3 className="mt-4 max-w-xs font-heading text-xl font-semibold leading-snug">
                  {title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="review-flow-title"
      className="bg-institutional py-20 text-primary-foreground sm:py-24 lg:py-28"
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-active">
              Decisão e liberação
            </p>
            <h2
              id="review-flow-title"
              className="mt-5 max-w-2xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl"
            >
              A entrega só vira receita depois da conferência.
            </h2>
          </div>
          <p className="max-w-xl border-l border-active pl-5 leading-7 text-primary-foreground/65">
            Se houver pendência, a ordem retorna ao técnico com orientação. Se
            estiver completa, a aprovação preserva o valor e libera o próximo
            passo administrativo.
          </p>
        </div>

        <ol
          aria-label="Etapas da revisão e faturamento"
          className="mt-12 grid border-l border-t border-primary-foreground/15 md:grid-cols-2 lg:grid-cols-[.9fr_.95fr_1.2fr_.95fr]"
        >
          {data.steps.map(([title, description], index) => (
            <li
              key={title}
              className={cn(
                'relative flex min-h-56 flex-col border-b border-r border-primary-foreground/15 bg-primary-foreground/[.035] p-6 sm:p-7',
                index === data.steps.length - 1 &&
                  'bg-active text-institutional',
              )}
            >
              <p
                className={cn(
                  'text-[10px] font-bold uppercase tracking-[.17em]',
                  index === data.steps.length - 1
                    ? 'text-institutional'
                    : 'text-active',
                )}
              >
                {reviewFlowLabels[index]}
              </p>
              <h3 className="mt-8 font-heading text-xl font-semibold leading-snug">
                {title}
              </h3>
              <p
                className={cn(
                  'mt-3 text-sm leading-6',
                  index === data.steps.length - 1
                    ? 'text-institutional/80'
                    : 'text-primary-foreground/60',
                )}
              >
                {description}
              </p>

              {index === 2 ? (
                <div
                  className="mt-6 grid gap-2"
                  aria-label="Possíveis decisões"
                >
                  <div className="border border-primary-foreground/15 px-3 py-2.5">
                    <p className="text-xs font-semibold">Solicitar correção</p>
                    <p className="mt-1 text-[10px] text-primary-foreground/50">
                      Retorna ao técnico
                    </p>
                  </div>
                  <div className="bg-active px-3 py-2.5 text-institutional">
                    <p className="text-xs font-semibold">Aprovar execução</p>
                    <p className="mt-1 text-[10px] text-institutional/70">
                      Libera a cobrança
                    </p>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function ProductHighlights({ data }: { data: ProductPageData }) {
  if (data.key === 'operations') {
    return (
      <section
        aria-labelledby="operations-pillars-title"
        className="border-b border-border bg-card"
      >
        <h2 id="operations-pillars-title" className="sr-only">
          Pilares da gestão operacional
        </h2>
        <div className="container-page grid border-l border-border md:grid-cols-3">
          {data.highlights.map(([title, description], index) => (
            <article
              key={title}
              className="relative min-h-44 border-b border-r border-border px-6 py-7 md:border-b-0 sm:px-8 sm:py-8"
            >
              <p className="text-[10px] font-bold uppercase tracking-[.17em] text-primary">
                {operationsHighlightLabels[index]}
              </p>
              <h3 className="mt-9 font-heading text-xl font-semibold leading-snug">
                {title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    )
  }

  if (data.key === 'field') {
    return (
      <section
        aria-labelledby="field-capabilities-title"
        className="border-b border-border bg-background py-5"
      >
        <h2 id="field-capabilities-title" className="sr-only">
          Recursos da execução em campo
        </h2>
        <div className="container-page">
          <ul className="grid border-l border-t border-border bg-card md:grid-cols-3">
            {data.highlights.map(([title, description], index) => (
              <li
                key={title}
                className={cn(
                  'border-b border-r border-border px-6 py-6 sm:px-7',
                  index === 1 && 'bg-muted/25',
                )}
              >
                <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.17em] text-primary">
                  <span
                    className={cn(
                      'size-2 rounded-full',
                      index === data.highlights.length - 1
                        ? 'bg-active'
                        : 'bg-primary',
                    )}
                    aria-hidden="true"
                  />
                  {fieldHighlightLabels[index]}
                </p>
                <h3 className="mt-5 font-heading text-xl font-semibold leading-snug">
                  {title}
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="review-capabilities-title"
      className="border-b border-border bg-card py-5"
    >
      <h2 id="review-capabilities-title" className="sr-only">
        Recursos de revisão e faturamento
      </h2>
      <div className="container-page">
        <ul className="grid border-l border-t border-border md:grid-cols-3">
          {data.highlights.map(([title, description], index) => (
            <li
              key={title}
              className={cn(
                'flex min-h-44 flex-col border-b border-r border-border bg-background px-6 py-6 sm:px-7',
                index === data.highlights.length - 1 &&
                  'border-institutional bg-institutional text-primary-foreground',
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <p
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-[.17em]',
                    index === data.highlights.length - 1
                      ? 'text-active'
                      : 'text-primary',
                  )}
                >
                  {reviewHighlightLabels[index]}
                </p>
                <span
                  className={cn(
                    'px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em]',
                    index === data.highlights.length - 1
                      ? 'bg-active text-institutional'
                      : 'bg-primary/8 text-primary',
                  )}
                >
                  {reviewHighlightStates[index]}
                </span>
              </div>
              <h3 className="mt-8 font-heading text-xl font-semibold leading-snug">
                {title}
              </h3>
              <p
                className={cn(
                  'mt-2 max-w-sm text-sm leading-6',
                  index === data.highlights.length - 1
                    ? 'text-primary-foreground/65'
                    : 'text-muted-foreground',
                )}
              >
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function RelatedProductNavigation({ data }: { data: ProductPageData }) {
  const currentPage = relatedPages.find((page) => page.key === data.key)
  const otherPages = relatedPages.filter((page) => page.key !== data.key)

  return (
    <section className="section-shell bg-background">
      <div className="container-page">
        <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_.78fr] lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
              Continue explorando
            </p>
            <h2 className="mt-5 max-w-2xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              Veja os outros recortes da mesma operação.
            </h2>
          </div>
          <p className="max-w-xl border-l border-primary pl-5 leading-7 text-muted-foreground">
            Você está em{' '}
            <strong className="font-semibold text-foreground">
              {currentPage?.title}
            </strong>
            . Siga para as outras responsabilidades que fazem a ordem avançar.
          </p>
        </div>

        <nav aria-label="Outras áreas do produto" className="mt-8">
          <div className="grid border-l border-t border-border md:grid-cols-2">
            {otherPages.map(({ key, title, description, href }) => (
              <Link
                key={key}
                href={href}
                className="group grid min-h-52 border-b border-r border-border bg-card p-6 transition-colors hover:bg-muted/35 sm:p-8"
              >
                <div className="flex items-start justify-between gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-[.17em] text-primary">
                    Conheça também
                  </span>
                  <span
                    className="grid size-9 shrink-0 place-items-center border border-border text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                    aria-hidden="true"
                  >
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
                <div className="mt-auto pt-10">
                  <h3 className="font-heading text-2xl font-semibold">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  )
}

export function ProductPage({ data }: { data: ProductPageData }) {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <ProductHero data={data} />

        <ProductHighlights data={data} />

        <ProductChapters data={data} />

        <ProductFlow data={data} />

        <RelatedProductNavigation data={data} />

        <section className="bg-background pb-6 sm:pb-10">
          <div className="container-page">
            <div className="landing-blueprint bg-institutional px-6 py-12 text-primary-foreground sm:px-10 sm:py-16 lg:px-16">
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <ShieldCheck className="size-6 text-active" />
                  <h2 className="mt-6 max-w-3xl text-balance font-heading text-3xl font-semibold leading-tight sm:text-4xl">
                    Organize a próxima ordem desde o começo.
                  </h2>
                  <p className="mt-5 max-w-xl leading-7 text-primary-foreground/65">
                    Crie sua organização e escolha a capacidade adequada para
                    sua equipe.
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
      </main>
      <Footer />
    </>
  )
}
