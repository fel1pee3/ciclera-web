'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  CircleAlert,
  ClipboardList,
  PlayCircle,
  type LucideIcon,
} from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { listFieldWorkOrders } from './api'
import type { FieldView } from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'

const summaries: Array<{
  view: FieldView
  label: string
  description: string
  icon: LucideIcon
  iconClassName: string
}> = [
  {
    view: 'TODAY',
    label: 'Hoje',
    description: 'Atendimentos previstos para hoje',
    icon: CalendarDays,
    iconClassName: 'bg-sky-100 text-sky-700',
  },
  {
    view: 'UPCOMING',
    label: 'Próximas',
    description: 'Próximos serviços da sua agenda',
    icon: CalendarRange,
    iconClassName: 'bg-violet-100 text-violet-700',
  },
  {
    view: 'IN_PROGRESS',
    label: 'Em execução',
    description: 'Serviços que você já iniciou',
    icon: PlayCircle,
    iconClassName: 'bg-emerald-100 text-emerald-700',
  },
  {
    view: 'PENDING',
    label: 'Pendentes',
    description: 'Correções que precisam de atenção',
    icon: CircleAlert,
    iconClassName: 'bg-amber-100 text-amber-700',
  },
]

export function FieldSummary() {
  const [totals, setTotals] = useState<Record<FieldView, number> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all(
      summaries.map(({ view }) =>
        listFieldWorkOrders({ page: 1, pageSize: 1, view }),
      ),
    )
      .then((pages) => {
        if (!active) return
        setTotals(
          Object.fromEntries(
            summaries.map(({ view }, index) => [
              view,
              pages[index]?.total ?? 0,
            ]),
          ) as Record<FieldView, number>,
        )
      })
      .catch((reason: unknown) => {
        if (active) setError(getFieldWorkOrderErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <span className="hidden size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm sm:grid">
            <ClipboardList aria-hidden="true" className="size-6" />
          </span>
          <div>
            <p className="eyebrow">Área de campo</p>
            <h1 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
              Seus atendimentos
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Acompanhe sua agenda, retome serviços iniciados e resolva
              pendências em um só lugar.
            </p>
          </div>
        </div>
      </header>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {!totals && !error ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {summaries.map(({ view }) => (
            <Skeleton key={view} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : null}
      {totals ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {summaries.map(
            ({ view, label, description, icon: Icon, iconClassName }) => (
              <Link
                className="group rounded-2xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                key={view}
                href={`/field/ordens?view=${view}`}
              >
                <Card className="h-full p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-2xl ${iconClassName}`}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <strong className="font-heading text-4xl leading-none">
                      {totals[view]}
                    </strong>
                  </div>
                  <h2 className="mt-5 font-heading text-lg font-semibold">
                    {label}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </Card>
              </Link>
            ),
          )}
        </div>
      ) : null}
      <Link
        className="group flex min-h-14 items-center justify-between rounded-2xl border bg-card px-5 font-semibold transition hover:border-primary/30 hover:bg-primary/5"
        href="/field/ordens"
      >
        <span>Ver todas as ordens</span>
        <ArrowRight
          aria-hidden="true"
          className="size-5 text-primary transition-transform group-hover:translate-x-1"
        />
      </Link>
    </section>
  )
}
