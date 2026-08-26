import {
  ArrowRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'

import { Brand } from './brand'
import { trustSignals } from './content'

export function Hero() {
  return (
    <section
      id="inicio"
      className="landing-blueprint overflow-hidden bg-institutional text-primary-foreground"
    >
      <div className="container-page relative pb-14 pt-16 sm:pt-20 lg:pb-20 lg:pt-24">
        <div className="grid min-w-0 items-center gap-14 xl:grid-cols-[minmax(0,.9fr)_minmax(34rem,1.1fr)] xl:gap-12">
          <div className="relative z-10 min-w-0">
            <p className="inline-flex items-center gap-2 border-l-2 border-active pl-3 text-xs font-bold uppercase tracking-[0.18em] text-active">
              Gestão de serviços externos
            </p>
            <h1 className="mt-7 max-w-3xl text-balance font-heading text-[clamp(2.65rem,5.4vw,5.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
              Nenhum serviço executado deve ficar{' '}
              <span className="text-active">sem faturar.</span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-primary-foreground/70 sm:text-lg sm:leading-8">
              A Ciclera conecta agenda, equipe técnica, evidências e revisão em
              um único fluxo — para o administrativo saber exatamente o que foi
              entregue e quanto já pode virar receita.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="inline-flex min-h-13 items-center justify-center gap-3 bg-active px-6 font-semibold text-institutional transition-colors hover:bg-accent"
              >
                Criar minha conta
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#produto"
                className="inline-flex min-h-13 items-center justify-center border border-primary-foreground/25 px-6 font-semibold text-primary-foreground transition-colors hover:border-primary-foreground/50 hover:bg-primary-foreground/7"
              >
                Ver a plataforma
              </a>
            </div>
            <p className="mt-4 text-xs text-primary-foreground/50">
              Acesso pelo navegador · Sem período de teste · Planos a partir de
              R$ 199/mês
            </p>
          </div>

          <HeroProductView />
        </div>

        <div className="mt-14 grid border-y border-primary-foreground/12 sm:grid-cols-3 lg:mt-20">
          {trustSignals.map(({ label, icon: Icon }, index) => (
            <div
              key={label}
              className={`flex items-center gap-3 py-4 text-sm text-primary-foreground/70 sm:px-5 ${
                index > 0
                  ? 'border-t border-primary-foreground/12 sm:border-l sm:border-t-0'
                  : ''
              }`}
            >
              <Icon className="size-4 text-active" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroProductView() {
  const stages = [
    ['Em execução', '3', 'R$ 3.840,00', Wrench],
    ['Aguardando revisão', '2', 'R$ 2.360,00', Clock3],
    ['Prontas para faturar', '4', 'R$ 7.920,00', FileCheck2],
  ] as const

  return (
    <div className="relative min-w-0" data-nosnippet="">
      <div className="absolute -left-8 top-10 hidden h-32 w-px bg-active/50 lg:block" />
      <div className="absolute -left-11 top-10 hidden size-6 place-items-center border border-active/50 bg-institutional text-[9px] font-bold text-active lg:grid">
        01
      </div>

      <div className="overflow-hidden border border-primary-foreground/16 bg-[#f4f8f6] text-foreground shadow-[0_32px_90px_rgba(0,0,0,.3)]">
        <div className="flex h-13 items-center justify-between border-b border-border bg-card px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="origin-left scale-[.78]">
              <Brand />
            </span>
            <span className="hidden h-5 w-px bg-border sm:block" />
            <p className="hidden truncate text-[10px] text-muted-foreground sm:block">
              Vértice Serviços Técnicos
            </p>
          </div>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-active" />
          </div>
        </div>

        <div className="grid min-h-[29rem] grid-cols-1 sm:grid-cols-[3.4rem_minmax(0,1fr)]">
          <aside className="hidden border-r border-border bg-card py-5 sm:flex sm:flex-col sm:items-center sm:gap-5">
            {[Building2, CalendarDays, Wrench, CircleDollarSign].map(
              (Icon, index) => (
                <span
                  key={index}
                  className={`grid size-8 place-items-center ${
                    index === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="size-3.5" />
                </span>
              ),
            )}
          </aside>

          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">
                  Garantia de receita
                </p>
                <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">
                  Visão operacional
                </h2>
              </div>
              <span className="border border-border bg-card px-3 py-1.5 text-[9px] font-semibold text-muted-foreground">
                Agosto de 2026
              </span>
            </div>

            <div className="mt-6 border-y border-border">
              {stages.map(([label, count, value, Icon], index) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border py-4 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`grid size-9 shrink-0 place-items-center ${
                        index === 2
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-primary'
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-primary">
                        {value}
                      </p>
                    </div>
                  </div>
                  <strong className="font-heading text-2xl font-semibold">
                    {count}
                  </strong>
                </div>
              ))}
            </div>

            <div className="mt-5 bg-card p-4 shadow-[0_8px_28px_rgba(9,46,46,.08)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-[.12em] text-primary">
                    OS-000184
                  </p>
                  <p className="mt-1 truncate font-heading text-sm font-semibold">
                    Manutenção preventiva do ar-condicionado
                  </p>
                  <p className="mt-1 truncate text-[10px] text-muted-foreground">
                    Hotel Serra Verde · Unidade Centro
                  </p>
                </div>
                <span className="shrink-0 bg-active/12 px-2.5 py-1 text-[9px] font-semibold text-primary">
                  Pronta para faturar
                </span>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                <div>
                  <p className="text-[9px] text-muted-foreground">
                    Responsável
                  </p>
                  <p className="text-[10px] font-semibold">Juarez Silva</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground">
                    Valor final
                  </p>
                  <p className="font-heading text-base font-semibold text-primary">
                    R$ 1.625,40
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-right text-[10px] text-primary-foreground/40">
        Interface demonstrativa com dados fictícios.
      </p>
    </div>
  )
}
