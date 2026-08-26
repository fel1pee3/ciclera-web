import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  capabilityGroups,
  commonPlanFeatures,
  faqs,
  pipeline,
  plans,
  problems,
  segments,
  steps,
} from './content'
import { ProductDemo } from './product-demo'

function Eyebrow({
  children,
  dark = false,
}: {
  children: React.ReactNode
  dark?: boolean
}) {
  return (
    <p
      className={cn(
        'text-xs font-bold uppercase tracking-[0.2em]',
        dark ? 'text-active' : 'text-primary',
      )}
    >
      {children}
    </p>
  )
}

function Title({
  children,
  dark = false,
}: {
  children: React.ReactNode
  dark?: boolean
}) {
  return (
    <h2
      className={cn(
        'mt-4 max-w-4xl text-balance font-heading text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.035em]',
        dark ? 'text-primary-foreground' : 'text-foreground',
      )}
    >
      {children}
    </h2>
  )
}

export function PositioningStrip() {
  return (
    <section
      className="border-b border-border bg-card"
      aria-label="Fluxo da Ciclera"
    >
      <div className="container-page py-8 lg:py-10">
        <div className="grid gap-7 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-center">
          <p className="font-heading text-lg font-semibold leading-snug">
            Uma ordem acompanha o trabalho inteiro.
          </p>
          <ol className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-5">
            {pipeline.map(([title, description], index) => (
              <li key={title} className="relative bg-card px-4 py-4">
                <p className="text-[9px] font-bold tracking-[.16em] text-primary">
                  0{index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold">{title}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {description}
                </p>
                {index < pipeline.length - 1 ? (
                  <ArrowRight className="absolute -right-2.5 top-1/2 z-10 hidden size-5 -translate-y-1/2 bg-card text-primary sm:block" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export function ProblemSection() {
  return (
    <section id="problema" className="section-shell bg-background">
      <div className="container-page grid gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>O intervalo que custa caro</Eyebrow>
          <Title>O serviço aconteceu. A informação ainda não chegou.</Title>
          <p className="mt-6 max-w-lg text-pretty leading-7 text-muted-foreground">
            A perda não acontece apenas quando uma OS é esquecida. Ela começa
            sempre que campo e escritório precisam reconstruir o que já deveria
            estar documentado.
          </p>
          <div className="mt-9 flex items-center gap-3 border-t border-border pt-5 text-sm font-semibold text-primary">
            <span className="h-px w-10 bg-primary" />A Ciclera fecha esse
            intervalo.
          </div>
        </div>

        <div className="border border-border bg-card shadow-[0_24px_70px_rgba(16,42,39,.06)]">
          <div className="grid gap-2 border-b border-border px-6 py-5 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
              Diagnóstico operacional
            </p>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground lg:text-right">
              Onde o fluxo perde contexto, tempo e receita.
            </p>
          </div>

          <ul>
            {problems.map(({ category, title, text, impact }) => (
              <li
                key={title}
                className="group relative grid gap-5 overflow-hidden border-b border-border px-6 py-8 last:border-b-0 before:absolute before:inset-y-0 before:left-0 before:w-1 before:origin-center before:scale-y-0 before:bg-primary before:transition-transform before:duration-300 hover:before:scale-y-100 sm:px-8 sm:py-9 lg:grid-cols-[10.5rem_minmax(0,1fr)] lg:gap-8"
              >
                <p className="max-w-40 text-[10px] font-bold uppercase leading-5 tracking-[.16em] text-primary">
                  {category}
                </p>
                <div>
                  <h3 className="max-w-xl text-xl font-semibold leading-snug sm:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
                    {text}
                  </p>
                  <p className="mt-6 flex items-center gap-3 text-sm font-semibold text-foreground">
                    <span
                      className="h-px w-8 shrink-0 bg-primary"
                      aria-hidden="true"
                    />
                    <span>
                      <span className="mr-1.5 text-muted-foreground">
                        Impacto:
                      </span>
                      {impact}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function WorkflowSection() {
  const stageDetails = [
    ['Planejamento', 'Contexto reunido'],
    ['Campo', 'Execução registrada'],
    ['Conferência', 'Entrega conferida'],
    ['Administrativo', 'Receita liberada'],
  ] as const

  return (
    <section id="como-funciona" className="section-shell bg-card">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_.75fr] lg:items-end">
          <div>
            <Eyebrow>Como funciona</Eyebrow>
            <Title>Uma linha contínua entre planejamento e receita.</Title>
          </div>
          <p className="max-w-xl text-pretty leading-7 text-muted-foreground lg:pb-1">
            Cada etapa deixa um registro para a próxima. Assim, o escritório
            acompanha a operação sem depender de mensagens paralelas ou
            conferências de última hora.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,.62fr)] lg:items-start lg:gap-12">
          <figure className="relative order-1 min-h-[26rem] overflow-hidden border border-border bg-background sm:min-h-[34rem] lg:order-2 lg:sticky lg:top-28 lg:min-h-[39rem]">
            <Image
              src="/workflow-bench-ciclera.png"
              alt="Ferramentas, identificação de equipamento e ordem de serviço organizadas no fluxo operacional da Ciclera"
              fill
              sizes="(max-width: 1024px) 100vw, 38vw"
              className="object-cover object-center"
            />
            <div className="absolute left-4 top-4 border border-white/40 bg-card/94 px-3 py-2 text-[10px] font-bold uppercase tracking-[.13em] text-primary shadow-lg backdrop-blur sm:left-6 sm:top-6">
              Evidência confirmada
            </div>
            <figcaption className="absolute inset-x-4 bottom-4 bg-institutional/94 p-4 text-primary-foreground shadow-2xl backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-active">
                Um registro alimenta o próximo
              </p>
              <div className="mt-3 flex items-end justify-between gap-5">
                <p className="max-w-xs text-sm font-semibold leading-relaxed">
                  Ordem, execução e valor permanecem conectados até a cobrança.
                </p>
                <span className="shrink-0 border border-active/30 bg-active/10 px-2.5 py-1.5 text-[9px] font-bold text-active">
                  Pronta para faturar
                </span>
              </div>
            </figcaption>
          </figure>

          <ol
            aria-label="Etapas do fluxo operacional"
            className="order-2 border-t border-border lg:order-1"
          >
            {steps.map(({ title, text }, index) => (
              <li
                key={title}
                className={cn(
                  'grid border-b border-border sm:grid-cols-[9.5rem_minmax(0,1fr)]',
                  index === steps.length - 1 &&
                    'border-primary bg-institutional text-primary-foreground',
                )}
              >
                <div
                  className={cn(
                    'border-b border-border px-5 py-5 sm:border-b-0 sm:border-r sm:px-6 sm:py-7',
                    index === steps.length - 1 &&
                      'border-primary-foreground/15',
                  )}
                >
                  <p
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-[.17em] text-primary',
                      index === steps.length - 1 && 'text-active',
                    )}
                  >
                    {stageDetails[index][0]}
                  </p>
                  <p
                    className={cn(
                      'mt-2 text-xs leading-5 text-muted-foreground',
                      index === steps.length - 1 &&
                        'text-primary-foreground/60',
                    )}
                  >
                    {stageDetails[index][1]}
                  </p>
                </div>
                <div className="px-5 py-6 sm:px-7 sm:py-7">
                  <h3 className="text-xl font-semibold leading-snug sm:text-2xl">
                    {title}
                  </h3>
                  <p
                    className={cn(
                      'mt-3 max-w-xl leading-7 text-muted-foreground',
                      index === steps.length - 1 &&
                        'text-primary-foreground/65',
                    )}
                  >
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export function DemoSection() {
  return (
    <section
      id="produto"
      className="section-shell bg-institutional text-primary-foreground"
    >
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <div>
            <Eyebrow dark>Produto, não promessa</Eyebrow>
            <Title dark>Veja o trabalho avançar dentro da Ciclera.</Title>
          </div>
          <div className="lg:pb-1">
            <p className="max-w-xl leading-7 text-primary-foreground/65">
              Explore quatro recortes do produto. Os dados são demonstrativos; o
              fluxo, os estados e a experiência refletem a plataforma real.
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-active">
              <span className="size-1.5 rounded-full bg-active" />
              Selecione uma etapa abaixo para navegar
            </p>
          </div>
        </div>
        <div className="mt-12 lg:mt-16">
          <ProductDemo />
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  const groupStates = [
    ['Preparar', 'Ordem pronta'],
    ['Executar', 'Execução documentada'],
    ['Conferir', 'Receita liberada'],
  ] as const

  return (
    <section id="controle" className="section-shell bg-background">
      <div className="container-page">
        <div className="max-w-4xl">
          <Eyebrow>O ciclo completo</Eyebrow>
          <Title>Três momentos. A mesma fonte de verdade.</Title>
          <p className="mt-6 max-w-2xl text-pretty leading-7 text-muted-foreground">
            A Ciclera não tenta substituir todos os sistemas da empresa. Ela
            organiza o trecho crítico entre a demanda do cliente e a liberação
            do serviço para faturamento.
          </p>
        </div>

        <ol
          aria-label="Momentos do ciclo operacional"
          className="mt-12 border border-border lg:mt-16"
        >
          {capabilityGroups.map(
            ({ label, title, description, items }, groupIndex) => (
              <li
                key={label}
                className={cn(
                  'border-b border-border last:border-b-0',
                  groupIndex === 1 &&
                    'border-primary bg-institutional text-primary-foreground',
                )}
              >
                <article className="grid gap-8 p-6 md:grid-cols-[.88fr_1.12fr] md:p-9 lg:gap-14 lg:p-12">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p
                        className={cn(
                          'text-xs font-bold uppercase tracking-[.18em] text-primary',
                          groupIndex === 1 && 'text-active',
                        )}
                      >
                        {label}
                      </p>
                      <span
                        className={cn(
                          'border border-primary/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-primary',
                          groupIndex === 1 &&
                            'border-active/30 bg-active/10 text-active',
                        )}
                      >
                        {groupStates[groupIndex][0]}
                      </span>
                    </div>
                    <h3 className="mt-5 max-w-lg font-heading text-2xl font-semibold leading-tight sm:text-3xl">
                      {title}
                    </h3>
                    <p
                      className={cn(
                        'mt-4 max-w-lg leading-7 text-muted-foreground',
                        groupIndex === 1 && 'text-primary-foreground/65',
                      )}
                    >
                      {description}
                    </p>
                    <p
                      className={cn(
                        'mt-7 border-t border-border pt-4 text-xs font-semibold text-foreground',
                        groupIndex === 1 &&
                          'border-primary-foreground/15 text-primary-foreground',
                      )}
                    >
                      Resultado: {groupStates[groupIndex][1]}
                    </p>
                  </div>
                  <ul
                    className={cn(
                      'border-y border-border',
                      groupIndex === 1 && 'border-primary-foreground/15',
                    )}
                  >
                    {items.map((item) => (
                      <li
                        key={item}
                        className={cn(
                          'flex items-start gap-4 border-b border-border py-4 text-sm font-medium leading-6 last:border-b-0',
                          groupIndex === 1 && 'border-primary-foreground/15',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'mt-3 h-px w-6 shrink-0 bg-primary',
                            groupIndex === 1 && 'bg-active',
                          )}
                        />
                        {item}
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

export function FieldSection() {
  return (
    <section
      id="campo"
      className="overflow-hidden bg-card py-6 sm:py-10 lg:py-16"
    >
      <div className="container-page">
        <div className="grid overflow-hidden border border-border bg-background lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative min-h-[31rem] overflow-hidden sm:min-h-[38rem] lg:min-h-[44rem]">
            <Image
              src="/field-technician-ciclera.png"
              alt="Técnico registrando evidências de um equipamento durante atendimento em campo"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-x-4 bottom-4 border border-white/25 bg-institutional/94 p-4 text-primary-foreground shadow-2xl backdrop-blur sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[21rem] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold tracking-[.14em] text-active">
                  OS-000184
                </p>
                <span className="bg-active/15 px-2 py-1 text-[9px] font-semibold text-active">
                  Em execução
                </span>
              </div>
              <p className="mt-2 font-heading text-sm font-semibold leading-snug">
                Manutenção preventiva do ar-condicionado
              </p>
              <div className="mt-4 grid grid-cols-2 border-t border-primary-foreground/15 pt-3 text-[10px] text-primary-foreground/65">
                <span className="flex items-center gap-1.5">
                  <Camera className="size-3.5 text-active" /> 2 fotos
                  confirmadas
                </span>
                <span className="flex items-center justify-end gap-1.5">
                  <Clock3 className="size-3.5 text-active" /> Salvo agora
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12 xl:p-16">
            <div>
              <Eyebrow>Feita para o campo</Eyebrow>
              <Title>Direta para o técnico. Visível para o escritório.</Title>
              <p className="mt-6 max-w-xl leading-7 text-muted-foreground">
                Quem executa acessa pelo celular, vê as ordens atribuídas e
                registra o atendimento no mesmo lugar. Quem administra acompanha
                o avanço sem interromper a equipe para pedir atualização.
              </p>
            </div>

            <div className="mt-12 border-t border-border">
              {[
                [
                  'Agenda pessoal',
                  'Somente as ordens atribuídas ao técnico',
                  CalendarDays,
                ],
                [
                  'Evidência confirmada',
                  'Fotos privadas após confirmação do servidor',
                  Camera,
                ],
                [
                  'Execução protegida',
                  'Versão e histórico preservados em cada alteração',
                  ShieldCheck,
                ],
              ].map(([title, text, Icon]) => (
                <div
                  key={title as string}
                  className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border py-5"
                >
                  <Icon className="mt-0.5 size-4.5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{title as string}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {text as string}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AudienceSection() {
  return (
    <section id="para-quem" className="bg-background py-16 sm:py-20 lg:py-24">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1.04fr_.96fr] lg:items-start lg:gap-14">
          <div>
            <Eyebrow>Para operações que acontecem fora do escritório</Eyebrow>
            <Title>O setor muda. O desafio operacional é o mesmo.</Title>
          </div>
          <p className="max-w-xl border-l border-primary pl-5 text-pretty leading-7 text-muted-foreground lg:mt-7">
            A Ciclera atende empresas B2B que instalam, inspecionam, reparam ou
            mantêm equipamentos nos locais de seus clientes — especialmente
            equipes com 5 a 30 técnicos externos.
          </p>
        </div>

        <ul
          aria-label="Segmentos atendidos"
          className="mt-10 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {segments.map(({ title, description }, index) => (
            <li
              key={title}
              className={cn(
                'border-b border-r border-border bg-card',
                index === segments.length - 1 &&
                  'border-primary bg-institutional text-primary-foreground',
              )}
            >
              <article className="flex h-full min-h-48 flex-col p-6 sm:p-7">
                <p
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-[.16em] text-primary',
                    index === segments.length - 1 && 'text-active',
                  )}
                >
                  Atendimento técnico externo
                </p>
                <h3 className="mt-5 max-w-[16rem] font-heading text-xl font-semibold leading-snug">
                  {title}
                </h3>
                <p
                  className={cn(
                    'mt-3 text-sm leading-6 text-muted-foreground',
                    index === segments.length - 1 &&
                      'text-primary-foreground/65',
                  )}
                >
                  {description}
                </p>
                <p
                  className={cn(
                    'mt-auto border-t border-border pt-4 text-[10px] font-semibold uppercase tracking-[.12em] text-muted-foreground',
                    index === segments.length - 1 &&
                      'border-primary-foreground/15 text-primary-foreground/55',
                  )}
                >
                  Cliente · local · equipamento
                </p>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-px overflow-hidden border border-primary-foreground/10 bg-primary-foreground/10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="bg-institutional p-7 text-primary-foreground sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-active">
              Um bom sinal de aderência
            </p>
            <p className="mt-5 max-w-lg font-heading text-2xl font-semibold leading-tight sm:text-3xl">
              Sua empresa já executa bem. O que falta é a informação chegar
              completa ao administrativo.
            </p>
          </div>
          <ul className="grid gap-px bg-primary-foreground/10">
            {[
              'A equipe ainda usa WhatsApp, papel ou planilhas em parte do fluxo.',
              'Serviços concluídos demoram para ser revisados e cobrados.',
              'Fotos, materiais ou observações precisam ser cobrados depois.',
              'O histórico de cada equipamento depende de buscas manuais.',
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 bg-institutional px-6 py-4 text-sm leading-relaxed text-primary-foreground/75"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-active" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  return (
    <section id="planos" className="section-shell bg-card">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-[1fr_.7fr] lg:items-end">
          <div>
            <Eyebrow>Planos transparentes</Eyebrow>
            <Title>Escolha a capacidade da sua operação.</Title>
          </div>
          <p className="max-w-xl leading-7 text-muted-foreground lg:pb-1">
            Todos os planos incluem o fluxo operacional completo. Você escolhe
            conforme o tamanho da equipe e o volume de evidências armazenadas.
          </p>
        </div>

        <div className="mt-12 grid border border-border lg:mt-16 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <article
              key={plan.code}
              className={cn(
                'relative flex min-h-full flex-col border-b border-border p-6 last:border-b-0 sm:p-8 lg:border-b-0 lg:border-r lg:last:border-r-0',
                plan.recommended
                  ? 'bg-institutional text-primary-foreground'
                  : 'bg-background',
              )}
            >
              {plan.recommended ? (
                <span className="absolute right-5 top-5 bg-active px-3 py-1 text-[9px] font-bold uppercase tracking-[.15em] text-institutional">
                  Recomendado
                </span>
              ) : null}
              <p
                className={cn(
                  'text-xs font-bold uppercase tracking-[.17em]',
                  plan.recommended ? 'text-active' : 'text-primary',
                )}
              >
                {plan.name}
              </p>
              <p
                className={cn(
                  'mt-4 min-h-12 max-w-xs text-sm leading-relaxed',
                  plan.recommended
                    ? 'text-primary-foreground/65'
                    : 'text-muted-foreground',
                )}
              >
                {plan.description}
              </p>
              <div className="mt-7 flex items-end gap-1">
                <span className="mb-1 text-sm font-semibold">R$</span>
                <strong className="font-heading text-5xl font-semibold tracking-[-.05em]">
                  {plan.price}
                </strong>
                <span
                  className={cn(
                    'mb-1 text-sm',
                    plan.recommended
                      ? 'text-primary-foreground/55'
                      : 'text-muted-foreground',
                  )}
                >
                  /mês
                </span>
              </div>

              <div
                className={cn(
                  'mt-8 border-y py-5',
                  plan.recommended
                    ? 'border-primary-foreground/15'
                    : 'border-border',
                )}
              >
                {[plan.technicians, plan.administrators, plan.storage].map(
                  (item) => (
                    <p
                      key={item}
                      className="flex items-center gap-2 py-1.5 text-sm"
                    >
                      <Check
                        className={cn(
                          'size-4 shrink-0',
                          plan.recommended ? 'text-active' : 'text-primary',
                        )}
                      />
                      {item}
                    </p>
                  ),
                )}
              </div>

              <Link
                href="/registro"
                className={cn(
                  'mt-8 flex min-h-12 items-center justify-between px-4 text-sm font-semibold transition-colors',
                  plan.recommended
                    ? 'bg-active text-institutional hover:bg-accent'
                    : 'bg-primary text-primary-foreground hover:bg-institutional',
                )}
              >
                Começar com {plan.name}
                <ArrowUpRight className="size-4" />
              </Link>
              <span
                className={cn(
                  'mt-4 text-[10px]',
                  plan.recommended
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground',
                )}
              >
                Plano {index + 1} de {plans.length} · cobrança mensal
              </span>
            </article>
          ))}
        </div>

        <div className="grid border-x border-b border-border bg-background md:grid-cols-2 lg:grid-cols-4">
          {commonPlanFeatures.map((feature, index) => (
            <p
              key={feature}
              className={cn(
                'flex items-start gap-2 border-b border-border px-5 py-4 text-xs leading-relaxed last:border-b-0 md:[&:nth-child(3)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0',
              )}
            >
              <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {feature}
              <span className="sr-only">Item {index + 1}</span>
            </p>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Sem período de teste. Pagamento processado em ambiente seguro. A
          operação é liberada após a confirmação da cobrança.
        </p>
      </div>
    </section>
  )
}

export function FaqSection() {
  return (
    <section id="duvidas" className="section-shell bg-background">
      <div className="container-page grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
        <div>
          <Eyebrow>Dúvidas frequentes</Eyebrow>
          <Title>Informação clara antes da sua escolha.</Title>
          <p className="mt-6 max-w-md leading-7 text-muted-foreground">
            Se a resposta que procura não estiver aqui, fale diretamente com a
            Ciclera pelos canais no rodapé.
          </p>
        </div>
        <div className="border-t border-border">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group border-b border-border">
              <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 font-semibold marker:hidden">
                {question}
                <span className="grid size-9 shrink-0 place-items-center border border-border transition-colors group-open:bg-primary group-open:text-primary-foreground">
                  <ChevronDown className="size-4 transition-transform duration-200 group-open:rotate-180" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 pr-12 text-sm leading-7 text-muted-foreground">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function GetStartedSection() {
  return (
    <section id="comece" className="bg-background pb-6 sm:pb-10">
      <div className="container-page">
        <div className="landing-blueprint relative overflow-hidden bg-institutional px-6 py-12 text-primary-foreground sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-active">
                Sua operação em movimento
              </p>
              <h2 className="mt-5 max-w-3xl text-balance font-heading text-[clamp(2rem,4.6vw,4.25rem)] font-semibold leading-[1.05] tracking-[-.04em]">
                O próximo serviço já pode nascer organizado.
              </h2>
              <p className="mt-6 max-w-xl leading-7 text-primary-foreground/65">
                Crie sua organização, escolha o plano adequado e conecte equipe,
                clientes, equipamentos e ordens em um único fluxo.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/registro"
                className="inline-flex min-h-13 items-center justify-between gap-8 bg-active px-6 font-semibold text-institutional transition-colors hover:bg-accent"
              >
                Criar minha conta
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-13 items-center justify-start border border-primary-foreground/20 px-6 font-semibold"
              >
                Já tenho uma conta
              </Link>
            </div>
          </div>
          <div className="relative z-10 mt-12 grid border-t border-primary-foreground/15 pt-5 text-xs text-primary-foreground/55 sm:grid-cols-3">
            <span className="flex items-center gap-2 py-2">
              <ShieldCheck className="size-4 text-active" /> Acesso protegido
            </span>
            <span className="flex items-center gap-2 py-2">
              <ReceiptText className="size-4 text-active" /> Planos mensais
            </span>
            <span className="flex items-center gap-2 py-2">
              <CircleDollarSign className="size-4 text-active" /> Sem período de
              teste
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
