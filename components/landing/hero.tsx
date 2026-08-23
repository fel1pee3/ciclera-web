import {
  ArrowRight,
  Check,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { Brand } from './brand'

export function Hero() {
  return (
    <section
      id="inicio"
      className="overflow-hidden bg-background pb-20 pt-16 lg:pb-28 lg:pt-24"
    >
      <div className="container-page grid min-w-0 items-center gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,.98fr)]">
        <div className="min-w-0">
          <p className="eyebrow">Sistema de gestão de ordens de serviço</p>
          <h1 className="mt-5 max-w-3xl text-balance font-heading text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Nenhum serviço executado deve ficar sem faturar.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            A Ciclera organiza equipes externas, clientes, equipamentos, agenda,
            execução em campo, fotos e revisão para mostrar o que foi concluído
            e quanto já está pronto para faturar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Criar minha conta
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-card px-6 font-semibold transition hover:bg-muted"
            >
              Conhecer a plataforma
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Comece pelo navegador e configure sua operação no seu ritmo.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {[
              'Para equipes com 5–30 técnicos',
              'Acesso pelo navegador',
              'Implantação acompanhada',
            ].map((x) => (
              <li className="flex items-center gap-2" key={x}>
                <Check className="size-4 text-primary" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="min-w-0 max-w-full">
          <HeroMockup />
        </div>
      </div>
    </section>
  )
}
function HeroMockup() {
  const stages = [
    {
      label: 'Em execução',
      count: '3',
      value: 'R$ 3.840,00',
      icon: Wrench,
    },
    {
      label: 'Aguardando revisão',
      count: '2',
      value: 'R$ 2.360,00',
      icon: Clock3,
    },
    {
      label: 'Prontas para faturar',
      count: '4',
      value: 'R$ 7.920,00',
      icon: FileCheck2,
    },
  ]

  return (
    <div className="relative min-w-0 max-w-full" data-nosnippet="">
      <div className="min-w-0 max-w-full overflow-hidden rounded-3xl border border-primary-foreground/10 bg-institutional shadow-2xl">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card px-4 py-4 text-foreground sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="-mr-2 shrink-0 origin-left scale-75">
              <Brand />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] leading-tight text-muted-foreground">
                Operação demonstrativa
              </p>
            </div>
          </div>
          <span className="max-w-24 rounded-full border border-border px-2.5 py-1 text-center text-[10px] font-semibold leading-tight text-muted-foreground sm:max-w-none sm:px-3">
            Agosto de 2026
          </span>
        </div>

        <div className="bg-[#f4f8f6] p-4 sm:p-6">
          <div className="flex min-w-0 items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Garantia de receita
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">
                Visão operacional
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Valores reais das ordens da organização.
              </p>
            </div>
            <CircleDollarSign className="hidden size-7 text-primary sm:block" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {stages.map(({ label, count, value, icon: Icon }, index) => (
              <div
                key={label}
                className={`min-w-0 rounded-2xl border p-4 ${
                  index === 2
                    ? 'border-primary/25 bg-primary text-primary-foreground'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-xs ${
                      index === 2
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {label}
                  </p>
                  <Icon
                    className={`size-4 ${
                      index === 2 ? 'text-accent' : 'text-primary'
                    }`}
                  />
                </div>
                <p className="mt-3 font-heading text-2xl font-semibold">
                  {count}
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${
                    index === 2 ? 'text-accent' : 'text-primary'
                  }`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 min-w-0 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  OS-000184
                </p>
                <p className="break-words font-heading text-sm font-semibold sm:truncate">
                  Manutenção preventiva do ar-condicionado
                </p>
                <p className="mt-1 break-words text-xs text-muted-foreground sm:truncate">
                  Hotel Serra Verde · Unidade Centro
                </p>
              </div>
              <span className="w-fit shrink-0 rounded-full bg-active/15 px-3 py-1 text-[10px] font-semibold text-primary">
                Pronta para faturar
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Conclusão</p>
                <strong>18 ago. 2026</strong>
              </div>
              <div>
                <p className="text-muted-foreground">Responsável</p>
                <strong>Juarez Silva</strong>
              </div>
              <div className="col-span-2 sm:col-span-1 sm:text-right">
                <p className="text-muted-foreground">Valor final</p>
                <strong className="text-primary">R$ 1.625,40</strong>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-muted-foreground">
            Dados exclusivamente demonstrativos.
          </p>
        </div>
      </div>
    </div>
  )
}
