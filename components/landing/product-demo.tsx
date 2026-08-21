'use client'

import { useState } from 'react'
import {
  CalendarClock,
  Camera,
  Check,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  MapPin,
  Search,
  Signature,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Brand } from './brand'

const tabs = ['Visão operacional', 'Ordens', 'Revisão', 'Faturamento'] as const

export function ProductDemo() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Visão operacional')

  return (
    <div className="overflow-hidden rounded-3xl border border-primary-foreground/15 bg-[#f4f8f6] text-card-foreground shadow-2xl">
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="-mr-3 origin-left scale-75">
            <Brand />
          </span>
          <div>
            <p className="text-[10px] text-muted-foreground">
              Vértice Serviços Técnicos
            </p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
          Demonstração
        </span>
      </div>

      <div
        className="flex overflow-x-auto border-b border-border bg-card px-2 sm:px-4"
        role="tablist"
        aria-label="Demonstração do produto"
      >
        {tabs.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={cn(
              'shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
              tab === item
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="min-h-[28rem] p-4 sm:p-6 md:p-8" role="tabpanel">
        {tab === 'Visão operacional' && <Overview />}
        {tab === 'Ordens' && <Orders />}
        {tab === 'Revisão' && <Review />}
        {tab === 'Faturamento' && <Billing />}
      </div>
    </div>
  )
}

function DemoHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h3 className="mt-1 font-heading text-xl font-semibold sm:text-2xl">
        {title}
      </h3>
    </div>
  )
}

function Overview() {
  const items = [
    ['Em execução', '3', 'R$ 3.840,00', Wrench],
    ['Aguardando revisão', '2', 'R$ 2.360,00', Clock3],
    ['Com pendência', '1', 'R$ 890,00', CalendarClock],
    ['Prontas para faturar', '4', 'R$ 7.920,00', FileCheck2],
    ['Faturadas no período', '7', 'R$ 12.480,00', CircleDollarSign],
  ] as const

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoHeading
            eyebrow="Garantia de receita"
            title="Visão operacional"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Valores reais das ordens da sua organização.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-xl border border-border bg-card px-3 py-2">
            01/08/2026
          </span>
          <span className="rounded-xl border border-border bg-card px-3 py-2">
            31/08/2026
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(([label, count, value, Icon], index) => (
          <div
            key={label}
            className={cn(
              'rounded-2xl border p-4',
              index === 3
                ? 'border-primary/25 bg-primary text-primary-foreground'
                : 'border-border bg-card',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={cn(
                  'text-xs',
                  index === 3
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground',
                )}
              >
                {label}
              </p>
              <Icon
                className={cn(
                  'size-4 shrink-0',
                  index === 3 ? 'text-accent' : 'text-primary',
                )}
              />
            </div>
            <p className="mt-4 font-heading text-2xl font-semibold">{count}</p>
            <p
              className={cn(
                'mt-1 text-xs font-semibold',
                index === 3 ? 'text-accent' : 'text-primary',
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Valor bloqueado por correção
          </p>
          <p className="mt-2 font-heading text-2xl font-semibold text-primary">
            R$ 890,00
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-heading text-sm font-semibold">
            Motivos recorrentes de bloqueio
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">
              Evidência precisa ser reenviada
            </span>
            <strong>1 ordem</strong>
          </div>
        </div>
      </div>
    </div>
  )
}

function Orders() {
  const rows = [
    {
      number: 'OS-000184',
      title: 'Manutenção preventiva do ar-condicionado',
      customer: 'Hotel Serra Verde · Unidade Centro',
      status: 'Em execução',
      date: '20 ago. · 09:00',
    },
    {
      number: 'OS-000183',
      title: 'Inspeção preventiva do quadro elétrico',
      customer: 'Clínica Bem-Estar · Unidade Jardins',
      status: 'Aguardando revisão',
      date: '19 ago. · 14:30',
    },
    {
      number: 'OS-000182',
      title: 'Correção no sistema de refrigeração',
      customer: 'Hotel Serra Verde · Unidade Aeroporto',
      status: 'Com pendência',
      date: '18 ago. · 10:00',
    },
  ]

  return (
    <div>
      <DemoHeading eyebrow="Operação" title="Ordens de serviço" />
      <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground">
          <Search className="size-4" />
          Buscar por número, título ou cliente
        </div>
        <span className="rounded-xl border border-border px-4 py-2 text-sm">
          Todos os estados
        </span>
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map((order) => (
          <article
            key={order.number}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {order.number}
                </p>
                <p className="mt-1 font-heading font-semibold">{order.title}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {order.customer}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
                  {order.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  {order.date}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function Review() {
  return (
    <div>
      <DemoHeading
        eyebrow="Conferência operacional"
        title="Aguardando revisão"
      />
      <div className="mt-5 grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl border border-primary/25 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              OS-000183
            </p>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary">
              Aguardando revisão
            </span>
          </div>
          <p className="mt-2 font-heading font-semibold">
            Inspeção preventiva do quadro elétrico
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Clínica Bem-Estar · enviado por Juarez Silva
          </p>
          <p className="mt-4 text-xs font-semibold text-primary">
            Há mais tempo aguardando
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-heading text-sm font-semibold">
            Conferência do atendimento
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['Observações', 'Preenchidas', Check],
              ['Fotos', '3 evidências', Camera],
              ['Assinatura', 'Recebida', Signature],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="rounded-xl bg-muted p-3">
                <Icon className="size-4 text-primary" />
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {label as string}
                </p>
                <p className="text-xs font-semibold">{value as string}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Valor final</p>
              <strong className="text-primary">R$ 1.582,00</strong>
            </div>
            <span className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              Aprovar execução
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Billing() {
  const rows = [
    ['OS-000184', 'Hotel Serra Verde', 'R$ 1.625,40'],
    ['OS-000181', 'Clínica Bem-Estar', 'R$ 2.480,00'],
  ]

  return (
    <div>
      <DemoHeading
        eyebrow="Controle administrativo"
        title="Prontas para faturar"
      />
      <p className="mt-2 text-sm text-muted-foreground">
        Serviços aprovados para acompanhamento.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ordens encontradas</p>
          <p className="mt-2 font-heading text-2xl font-semibold">4</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary p-4 text-primary-foreground">
          <p className="text-xs text-primary-foreground/70">
            Valor pronto para faturar
          </p>
          <p className="mt-2 font-heading text-2xl font-semibold text-accent">
            R$ 7.920,00
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([number, customer, value]) => (
          <article
            key={number}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {number}
                </p>
                <p className="mt-1 text-sm font-semibold">{customer}</p>
              </div>
              <strong className="text-sm">{value}</strong>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Concluída e aprovada em 18 ago. 2026
            </p>
            <div className="mt-4 rounded-xl bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground">
              Marcar como faturada
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
