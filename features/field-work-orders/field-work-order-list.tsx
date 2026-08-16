'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { WorkOrderStatusBadge } from '@/features/work-orders/status-badge'
import { listFieldWorkOrders } from './api'
import {
  fieldViews,
  type FieldView,
  type FieldWorkOrderPage,
} from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'

const labels: Record<FieldView, string> = {
  TODAY: 'Hoje',
  UPCOMING: 'Próximas',
  IN_PROGRESS: 'Em execução',
  PENDING: 'Pendentes',
}
const pageSize = 10

export function FieldWorkOrderList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = useMemo(() => readFieldQuery(searchParams), [searchParams])
  const [result, setResult] = useState<FieldWorkOrderPage | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void listFieldWorkOrders(query)
      .then((page) => {
        if (active) {
          setResult(page)
          setError(null)
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(getFieldWorkOrderErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [query])

  const selectView = (view: string) => {
    const params = new URLSearchParams()
    if (view) params.set('view', view)
    router.replace(`/field/ordens${params.size ? `?${params}` : ''}`)
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="eyebrow">Atendimentos</p>
        <h1 className="mt-3 font-heading text-2xl font-bold">Minhas ordens</h1>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtros de atendimentos"
      >
        <button
          className={buttonVariants({
            variant: query.view ? 'ghost' : 'default',
          })}
          onClick={() => selectView('')}
        >
          Todas
        </button>
        {fieldViews.map((view) => (
          <button
            key={view}
            className={buttonVariants({
              variant: query.view === view ? 'default' : 'ghost',
            })}
            onClick={() => selectView(view)}
          >
            {labels[view]}
          </button>
        ))}
      </div>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {!result && !error ? (
        <div className="space-y-3">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : null}
      {result?.total === 0 ? (
        <EmptyState
          title="Nenhum atendimento nesta visão"
          description="As ordens aparecerão aqui quando forem atribuídas a você."
        />
      ) : null}
      {result?.items.length ? (
        <div className="space-y-3">
          {result.items.map((order) => (
            <article
              key={order.id}
              className="min-w-0 rounded-2xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">
                    {order.number}
                  </p>
                  <h2 className="mt-1 break-words font-heading text-lg font-bold">
                    {order.title}
                  </h2>
                </div>
                <WorkOrderStatusBadge status={order.status} />
              </div>
              <p className="mt-3 text-sm font-medium">{order.customer.name}</p>
              <p className="mt-1 break-words text-sm text-muted-foreground">
                {order.location.name} ·{' '}
                {formatDate(order.scheduledStartAt, result.timezone)}
              </p>
              <Link
                className={`${buttonVariants()} mt-4 w-full`}
                href={`/field/ordens/${order.id}?from=${encodeURIComponent(fieldListUrl(query))}`}
              >
                Ver atendimento
              </Link>
            </article>
          ))}
        </div>
      ) : null}
      {result && result.total > result.pageSize ? (
        <nav
          className="flex items-center justify-between"
          aria-label="Paginação"
        >
          <PageLink
            disabled={result.page <= 1}
            href={fieldListUrl({ ...query, page: result.page - 1 })}
          >
            Anterior
          </PageLink>
          <span className="text-sm text-muted-foreground">
            Página {result.page}
          </span>
          <PageLink
            disabled={result.page * result.pageSize >= result.total}
            href={fieldListUrl({ ...query, page: result.page + 1 })}
          >
            Próxima
          </PageLink>
        </nav>
      ) : null}
    </section>
  )
}

export function readFieldQuery(params: URLSearchParams) {
  const page = Number(params.get('page'))
  const view = params.get('view')
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize,
    ...(fieldViews.includes(view as never) ? { view: view as FieldView } : {}),
  }
}
export function fieldListUrl(query: {
  page: number
  pageSize: number
  view?: FieldView
}) {
  const params = new URLSearchParams()
  if (query.page > 1) params.set('page', String(query.page))
  if (query.view) params.set('view', query.view)
  return `/field/ordens${params.size ? `?${params}` : ''}`
}
function formatDate(value: string | null, timezone: string) {
  return value
    ? new Intl.DateTimeFormat('pt-BR', {
        timeZone: timezone,
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Horário não informado'
}
function PageLink({
  disabled,
  href,
  children,
}: {
  disabled: boolean
  href: string
  children: React.ReactNode
}) {
  return disabled ? (
    <span aria-disabled="true" className="text-sm text-muted-foreground">
      {children}
    </span>
  ) : (
    <Link className="text-sm font-semibold text-primary" href={href}>
      {children}
    </Link>
  )
}
