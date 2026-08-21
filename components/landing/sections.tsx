import {
  CalendarClock,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  FileSpreadsheet,
  Globe2,
  Home,
  MessageSquareText,
  Monitor,
  ReceiptText,
  Route,
  Search,
  Wrench,
} from 'lucide-react'
import { benefits, faqs, features, problems, segments, steps } from './content'
import { ProductDemo } from './product-demo'
import { Brand } from './brand'

const Eyebrow = ({
  children,
  dark = false,
}: {
  children: React.ReactNode
  dark?: boolean
}) => <p className={dark ? 'eyebrow text-active' : 'eyebrow'}>{children}</p>
const Title = ({
  children,
  dark = false,
}: {
  children: React.ReactNode
  dark?: boolean
}) => (
  <h2
    className={dark ? 'section-title text-primary-foreground' : 'section-title'}
  >
    {children}
  </h2>
)

export function PositioningStrip() {
  const stages = [
    ['Chamado', 'Demanda registrada', MessageSquareText],
    ['Planejamento', 'Agenda e responsável', CalendarClock],
    ['Execução', 'Trabalho em campo', Wrench],
    ['Evidências', 'Fotos e assinatura', Camera],
    ['Revisão', 'Conferência do serviço', ClipboardCheck],
    ['Faturamento', 'Receita liberada', ReceiptText],
  ] as const

  return (
    <section className="border-y border-border bg-card py-10">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <p className="text-center font-heading text-xl font-semibold">
          Do chamado ao caixa, cada etapa sob controle.
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          A informação acompanha a ordem do primeiro contato até a liberação da
          receita.
        </p>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="absolute left-[8%] right-[8%] top-6 hidden h-px bg-primary/20 lg:block" />
          {stages.map(([title, description, Icon], index) => (
            <div
              key={title}
              className="relative rounded-2xl border border-border bg-background p-4 lg:border-0 lg:bg-transparent lg:p-0 lg:text-center"
            >
              <div className="relative z-10 flex items-center gap-3 lg:flex-col">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-card text-primary shadow-sm">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    0{index + 1}
                  </p>
                  <p className="font-heading text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProblemSection() {
  return (
    <section id="problema" className="section bg-background">
      <div className="container-page">
        <div className="max-w-3xl">
          <Eyebrow>Onde a receita se perde</Eyebrow>
          <Title>Serviço realizado não deveria virar receita esquecida.</Title>
          <p className="section-copy">
            Quando campo e escritório trabalham em ferramentas diferentes,
            informações somem, a revisão atrasa e o faturamento depende de
            conferências manuais.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {problems.map(({ title, text, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-6 font-heading text-lg font-semibold">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WorkflowSection() {
  return (
    <section id="como-funciona" className="section bg-card">
      <div className="container-page">
        <div className="max-w-3xl">
          <Eyebrow>Um ciclo, não ferramentas isoladas</Eyebrow>
          <Title>
            Acompanhe cada serviço até ele estar pronto para faturar.
          </Title>
        </div>
        <ol className="mt-12 grid gap-4 lg:grid-cols-5">
          {steps.map(([title, text], i) => (
            <li
              key={title}
              className="relative rounded-2xl border border-border bg-background p-6"
            >
              <span className="font-heading text-sm font-bold text-primary">
                0{i + 1}
              </span>
              <h3 className="mt-8 font-heading text-lg font-semibold">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function DemoSection() {
  return (
    <section className="section bg-institutional">
      <div className="container-page">
        <div className="max-w-3xl">
          <Eyebrow dark>Visibilidade operacional</Eyebrow>
          <Title dark>
            Veja o que foi executado, o que está bloqueado e o que já pode virar
            receita.
          </Title>
          <p className="mt-5 text-primary-foreground/65">
            Dados exclusivamente demonstrativos para apresentar o fluxo do
            produto.
          </p>
        </div>
        <div className="mt-12">
          <ProductDemo />
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="section bg-background">
      <div className="container-page">
        <div className="max-w-3xl">
          <Eyebrow>O essencial para controlar a operação</Eyebrow>
          <Title>
            Menos recursos dispersos. Mais controle sobre o ciclo completo.
          </Title>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, text, icon: Icon }) => (
            <article key={title} className="bg-card p-6">
              <Icon className="size-5 text-primary" />
              <h3 className="mt-5 font-heading font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FieldSection() {
  return (
    <section className="section overflow-hidden bg-card">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Eyebrow>Acesso web para o técnico</Eyebrow>
          <Title>
            Simples para quem executa. Completo para quem administra.
          </Title>
          <p className="section-copy">
            O técnico acessa a Ciclera pelo navegador e registra o atendimento
            sem precisar instalar um aplicativo. No escritório, a equipe
            acompanha as etapas, revisa evidências e libera o serviço para
            faturamento.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="chip">
              <Globe2 className="size-4" />
              Acesso pelo navegador
            </span>
            <span className="chip">
              <Monitor className="size-4" />
              Computador, tablet ou celular
            </span>
          </div>
        </div>
        <FieldMockups />
      </div>
    </section>
  )
}
function FieldMockups() {
  return (
    <div className="relative mx-auto min-h-[31rem] w-full max-w-xl">
      <div className="absolute right-0 top-6 hidden w-[82%] overflow-hidden rounded-3xl border border-border bg-background shadow-xl sm:block">
        <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="-mr-3 origin-left scale-75">
              <Brand />
            </span>
            <div>
              <p className="text-[10px] text-muted-foreground">
                Juarez Silva · Técnico
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
            Área de campo
          </span>
        </div>
        <div className="p-5 pl-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Atendimentos
          </p>
          <h3 className="mt-1 font-heading text-xl font-semibold">
            Minhas ordens
          </h3>
          <div className="mt-4 flex gap-2 text-[10px]">
            <span className="rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground">
              Todas
            </span>
            {['Hoje', 'Próximas', 'Em execução'].map((filter) => (
              <span key={filter} className="rounded-lg bg-card px-3 py-2">
                {filter}
              </span>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  OS-000184
                </p>
                <p className="mt-1 font-heading text-sm font-semibold">
                  Manutenção preventiva do ar-condicionado
                </p>
              </div>
              <span className="rounded-full bg-active/15 px-2 py-1 text-[9px] font-semibold text-primary">
                Agendada
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-[10px] text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="size-3.5 text-primary" /> 20 ago. 2026
                · 09:00
              </p>
              <p className="flex items-center gap-2">
                <Home className="size-3.5 text-primary" /> Hotel Serra Verde ·
                Unidade Centro
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-primary px-3 py-2 text-center text-[10px] font-semibold text-primary-foreground">
              Ver atendimento
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 w-64 -translate-x-1/2 overflow-hidden rounded-[2rem] border-[5px] border-institutional bg-background shadow-2xl sm:left-0 sm:translate-x-0">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center">
            <span className="-mr-4 origin-left scale-[.62]">
              <Brand />
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground">
            ciclera.online
          </span>
        </div>
        <div className="p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
            Área de campo
          </p>
          <h3 className="mt-1 font-heading text-lg font-semibold">
            Seus atendimentos
          </h3>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Acompanhe sua agenda e retome serviços iniciados.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ['Hoje', '1', CalendarDays],
              ['Próximas', '3', CalendarClock],
              ['Em execução', '1', Wrench],
              ['Pendentes', '0', ClipboardList],
            ].map(([label, value, Icon]) => (
              <div
                key={label as string}
                className="rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-3.5 text-primary" />
                  <strong className="font-heading text-lg">
                    {value as string}
                  </strong>
                </div>
                <p className="mt-2 text-[9px] font-semibold">
                  {label as string}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-border bg-card p-3">
            <p className="text-[9px] font-bold text-primary">PRÓXIMO</p>
            <p className="mt-1 text-[10px] font-semibold">
              OS-000184 · Hotel Serra Verde
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground">
              Hoje, 09:00 · Unidade Centro
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-border bg-card p-2 text-center text-[9px]">
          <span className="rounded-lg bg-primary/10 py-2 font-semibold text-primary">
            Resumo
          </span>
          <span className="py-2 text-muted-foreground">Ordens</span>
        </div>
      </div>
    </div>
  )
}

export function AudienceSection() {
  const qualifiers = [
    'Possui entre 5 e 30 técnicos externos.',
    'Executa dezenas ou centenas de ordens por mês.',
    'Usa WhatsApp, papel ou planilhas durante a operação.',
    'Tem dificuldade para acompanhar serviços concluídos.',
    'Demora para revisar evidências e liberar faturamento.',
    'Perde informações sobre serviços ou materiais adicionais.',
  ]
  return (
    <section id="para-quem" className="section bg-background">
      <div className="container-page">
        <div className="max-w-3xl">
          <Eyebrow>Construída para operações reais</Eyebrow>
          <Title>
            Para empresas que dependem do trabalho realizado fora do escritório.
          </Title>
          <p className="section-copy">
            A Ciclera foi pensada para operações B2B com equipes externas,
            equipamentos atendidos e ordens que precisam chegar completas ao
            administrativo.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {segments.map(({ title, icon: Icon }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <Icon className="size-5 text-primary" />
              <span className="font-semibold">{title}</span>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-8 rounded-2xl bg-institutional p-7 text-primary-foreground lg:grid-cols-2 lg:p-10">
          <div>
            <p className="font-heading text-2xl font-semibold">
              A Ciclera faz sentido se sua empresa:
            </p>
            <a
              href="/registro"
              className="mt-8 inline-flex rounded-xl bg-active px-5 py-3 font-semibold text-institutional"
            >
              Criar minha conta
            </a>
          </div>
          <ul className="grid gap-3">
            {qualifiers.map((q) => (
              <li
                key={q}
                className="flex gap-3 text-sm text-primary-foreground/80"
              >
                <Check className="size-5 shrink-0 text-active" />
                {q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function BenefitsSection() {
  return (
    <section className="section bg-card">
      <div className="container-page">
        <Title>O resultado começa com visibilidade.</Title>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map(([title, text]) => (
            <article key={title}>
              <CircleDollarSign className="size-5 text-primary" />
              <h3 className="mt-5 font-heading text-lg font-semibold">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-muted/60 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-card text-muted-foreground shadow-sm">
                <FileSpreadsheet className="size-5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Antes · informação espalhada
                </span>
                <p className="font-heading text-lg font-semibold">
                  Cada etapa em um lugar diferente
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                ['WhatsApp', MessageSquareText],
                ['Papel', ClipboardList],
                ['Planilha', FileSpreadsheet],
                ['Conferência manual', Search],
              ].map(([label, Icon]) => (
                <div
                  key={label as string}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-3"
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span>{label as string}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              A equipe precisa reconstruir o atendimento antes de saber se ele
              pode ser faturado.
            </p>
          </div>

          <div className="rounded-3xl border border-primary/20 bg-primary p-6 text-primary-foreground sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary-foreground/10 text-accent">
                <Route className="size-5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-active">
                  Com a Ciclera · fluxo rastreável
                </span>
                <p className="font-heading text-lg font-semibold">
                  Uma ordem, do campo à receita
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-4">
              {['Execução', 'Evidências', 'Revisão', 'Faturamento'].map(
                (stage, index) => (
                  <div
                    key={stage}
                    className="relative rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-3"
                  >
                    <p className="text-[9px] font-bold text-active">
                      0{index + 1}
                    </p>
                    <p className="mt-1 text-xs font-semibold">{stage}</p>
                  </div>
                ),
              )}
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-active px-4 py-3 text-institutional">
              <span className="text-sm font-semibold">Pronta para faturar</span>
              <CircleDollarSign className="size-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function GetStartedSection() {
  const items = [
    'Cadastre sua organização e acesse imediatamente.',
    'Adicione equipe, clientes, locais e equipamentos.',
    'Planeje ordens e acompanhe a execução em campo.',
    'Revise evidências antes de liberar o faturamento.',
    'Mantenha histórico, valores e responsáveis rastreáveis.',
  ]
  return (
    <section
      id="comece"
      className="section bg-institutional text-primary-foreground"
    >
      <div className="container-page grid gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow dark>Comece com sua operação</Eyebrow>
          <Title dark>
            Organize o caminho do chamado ao caixa em um só lugar.
          </Title>
          <p className="mt-5 max-w-xl leading-relaxed text-primary-foreground/70">
            Crie a organização, convide sua equipe e configure os cadastros
            essenciais para iniciar as primeiras ordens de serviço.
          </p>
          <a
            href="/registro"
            className="mt-8 inline-flex rounded-xl bg-active px-6 py-3.5 font-semibold text-institutional"
          >
            Criar minha conta
          </a>
          <p className="mt-3 text-sm text-primary-foreground/55">
            Já possui conta?{' '}
            <a href="/login" className="underline">
              Entrar
            </a>
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {items.map((x) => (
            <li
              key={x}
              className="flex gap-3 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 text-sm text-primary-foreground/80"
            >
              <Check className="size-5 shrink-0 text-active" />
              {x}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function FaqSection() {
  return (
    <section className="section bg-background">
      <div className="container-page grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
        <div>
          <Eyebrow>Dúvidas frequentes</Eyebrow>
          <Title>O que você precisa saber antes de conversar.</Title>
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map(([q, a]) => (
            <details
              key={q}
              className="group rounded-xl border border-border bg-card p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {q}
                <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 pr-8 text-sm leading-relaxed text-muted-foreground">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
