'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { listFieldWorkOrders } from './api'
import type { FieldView } from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'

const summaries: Array<{ view: FieldView; label: string }> = [
  { view: 'TODAY', label: 'Hoje' },
  { view: 'UPCOMING', label: 'Próximas' },
  { view: 'IN_PROGRESS', label: 'Em execução' },
  { view: 'PENDING', label: 'Pendentes' },
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
    <section className="space-y-5">
      <div>
        <p className="eyebrow">Área de campo</p>
        <h1 className="mt-3 font-heading text-2xl font-bold">
          Seus atendimentos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Somente ordens atualmente atribuídas a você.
        </p>
      </div>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {!totals && !error ? (
        <div className="grid grid-cols-2 gap-3">
          {summaries.map(({ view }) => (
            <Skeleton key={view} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : null}
      {totals ? (
        <div className="grid grid-cols-2 gap-3">
          {summaries.map(({ view, label }) => (
            <Link key={view} href={`/field/ordens?view=${view}`}>
              <Card className="h-full p-4">
                <span className="text-sm text-muted-foreground">{label}</span>
                <strong className="mt-2 block font-heading text-3xl">
                  {totals[view]}
                </strong>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}
      <Link
        className="inline-flex min-h-11 items-center font-semibold text-primary"
        href="/field/ordens"
      >
        Ver todas as ordens →
      </Link>
    </section>
  )
}
