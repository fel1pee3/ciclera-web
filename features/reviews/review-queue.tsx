'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterPanel } from '@/components/ui/filter-panel'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import { listReviews } from './api'
import type { ReviewQueue } from './contracts'

const pageSize = 12

export function ReviewQueueList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = useMemo(() => {
    const page = Number(searchParams.get('page'))
    const order = searchParams.get('orderBy')
    return {
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize,
      orderBy:
        order === 'EXPECTED_AMOUNT_DESC'
          ? ('EXPECTED_AMOUNT_DESC' as const)
          : ('AGING_DESC' as const),
    }
  }, [searchParams])
  const [result, setResult] = useState<ReviewQueue | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void listReviews(query)
      .then((value) => {
        if (active) {
          setResult(value)
          setError(null)
        }
      })
      .catch(() => active && setError('Não foi possível carregar a fila.'))
    return () => {
      active = false
    }
  }, [query])

  function navigate(page: number, orderBy = query.orderBy) {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (orderBy !== 'AGING_DESC') params.set('orderBy', orderBy)
    router.push(`/app/revisao${params.size ? `?${params}` : ''}`)
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="eyebrow">Conferência operacional</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">
          Aguardando revisão
        </h1>
      </header>
      <FilterPanel
        activeFilterCount={query.orderBy === 'AGING_DESC' ? 0 : 1}
        title="Organizar fila"
        description="Escolha como priorizar as execuções que aguardam conferência."
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,24rem)_auto] sm:items-end">
          <Label className="grid gap-2">
            <span>Ordenar por</span>
            <select
              className="input"
              value={query.orderBy}
              onChange={(event) =>
                navigate(1, event.target.value as typeof query.orderBy)
              }
            >
              <option value="AGING_DESC">Há mais tempo aguardando</option>
              <option value="EXPECTED_AMOUNT_DESC">Maior valor previsto</option>
            </select>
          </Label>
          {query.orderBy !== 'AGING_DESC' ? (
            <Link
              className={buttonVariants({ variant: 'ghost' })}
              href="/app/revisao"
            >
              Restaurar ordem padrão
            </Link>
          ) : null}
        </div>
      </FilterPanel>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {!result && !error ? (
        <Skeleton
          className="h-64 rounded-2xl"
          aria-label="Carregando revisões"
        />
      ) : null}
      {result?.total === 0 ? (
        <EmptyState
          title="Nenhuma ordem aguardando revisão"
          description="Novas execuções enviadas pelos técnicos aparecerão aqui."
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {result?.items.map((item) => (
          <Card className="p-5" key={item.id}>
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {item.number}
                </p>
                <h2 className="mt-1 font-heading text-lg font-bold">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.customer.name}
                </p>
              </div>
              <span className="text-right text-sm font-semibold">
                {formatAging(item.agingSeconds)}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Previsto</dt>
                <dd>{formatMoney(item.expectedAmountInCents)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Adicionais</dt>
                <dd>{formatMoney(item.additionalTotalInCents)}</dd>
              </div>
            </dl>
            <Link
              className={`${buttonVariants({ variant: 'outline' })} mt-5 w-full`}
              href={`/app/revisao/${item.id}`}
            >
              Revisar atendimento
            </Link>
          </Card>
        ))}
      </div>
      {result && result.total > result.pageSize ? (
        <nav className="flex justify-between" aria-label="Paginação da revisão">
          <button
            disabled={result.page === 1}
            onClick={() => navigate(result.page - 1)}
          >
            Anterior
          </button>
          <span>Página {result.page}</span>
          <button
            disabled={result.page * result.pageSize >= result.total}
            onClick={() => navigate(result.page + 1)}
          >
            Próxima
          </button>
        </nav>
      ) : null}
    </section>
  )
}

export function formatMoney(value: string | null) {
  if (value === null) return 'Não informado'
  const cents = BigInt(value)
  const whole = cents / BigInt(100)
  const fraction = (cents % BigInt(100)).toString().padStart(2, '0')
  return `R$ ${whole.toLocaleString('pt-BR')},${fraction}`
}

function formatAging(seconds: number) {
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))} min`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`
  return `${Math.floor(seconds / 86400)} dias`
}
