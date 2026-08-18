'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { FilterPanel } from '@/components/ui/filter-panel'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { listWorkOrders, type ListWorkOrdersQuery } from './api'
import {
  workOrderPriorities,
  workOrderStatuses,
  type WorkOrderPage,
} from './contracts'
import { getWorkOrderErrorMessage } from './errors'
import { WorkOrderStatusBadge, workOrderStatusLabel } from './status-badge'
import { WorkOrderForm } from './work-order-form'

const pageSize = 12
const priorityLabels = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
} as const

export function WorkOrderList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = useMemo(() => readWorkOrderQuery(searchParams), [searchParams])
  const [search, setSearch] = useState(query.search ?? '')
  const [result, setResult] = useState<WorkOrderPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search.trim() === (query.search ?? '')) return
      const next = new URLSearchParams(searchParams)
      next.delete('page')
      if (search.trim()) next.set('search', search.trim())
      else next.delete('search')
      router.replace(`${pathname}${next.size ? `?${next}` : ''}`)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [pathname, query.search, router, search, searchParams])

  useEffect(() => {
    let active = true
    void listWorkOrders(query)
      .then((page) => {
        if (active) {
          setResult(page)
          setError(null)
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(getWorkOrderErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [query, revision])

  const changeFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    next.delete('page')
    if (value) next.set(key, value)
    else next.delete(key)
    router.replace(`${pathname}${next.size ? `?${next}` : ''}`)
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Operação</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">
            Ordens de serviço
          </h1>
        </div>
        <Button onClick={() => setCreating(true)}>Nova ordem</Button>
      </header>
      {notice ? <Alert variant="success">{notice}</Alert> : null}
      <Modal
        className="sm:max-w-4xl"
        open={creating}
        onClose={() => setCreating(false)}
        title="Nova ordem de serviço"
        description="Defina o atendimento, o planejamento e o valor previsto da ordem."
      >
        <WorkOrderForm
          embedded
          onCancel={() => setCreating(false)}
          onSaved={(order) => {
            setCreating(false)
            setNotice(`${order.number} foi criada.`)
            setRevision((value) => value + 1)
          }}
        />
      </Modal>
      <FilterPanel
        activeFilterCount={
          Number(Boolean(query.search)) +
          Number(Boolean(query.status)) +
          Number(Boolean(query.priority))
        }
        description="Busque ordens e combine status e prioridade para encontrar o atendimento certo."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Label className="grid gap-2">
            <span>Buscar ordem</span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Número ou título"
            />
          </Label>
          <Label className="grid gap-2">
            <span>Status</span>
            <select
              className="input"
              value={query.status ?? ''}
              onChange={(event) => changeFilter('status', event.target.value)}
            >
              <option value="">Todos os status</option>
              {workOrderStatuses.map((status) => (
                <option key={status} value={status}>
                  {workOrderStatusLabel(status)}
                </option>
              ))}
            </select>
          </Label>
          <Label className="grid gap-2">
            <span>Prioridade</span>
            <select
              className="input"
              value={query.priority ?? ''}
              onChange={(event) => changeFilter('priority', event.target.value)}
            >
              <option value="">Todas as prioridades</option>
              {workOrderPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </Label>
        </div>
        {query.search || query.status || query.priority ? (
          <div className="mt-5 flex justify-end border-t pt-5">
            <Link
              className={buttonVariants({ variant: 'ghost' })}
              href="/app/ordens"
            >
              Limpar filtros
            </Link>
          </div>
        ) : null}
      </FilterPanel>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {!result && !error ? (
        <Skeleton className="h-64 rounded-2xl" aria-label="Carregando ordens" />
      ) : null}
      {result?.total === 0 ? (
        <EmptyState
          title={
            query.search || query.status || query.priority
              ? 'Nenhuma ordem encontrada'
              : 'Nenhuma ordem cadastrada'
          }
          description="Crie uma ordem ou ajuste os filtros atuais."
          action={
            !query.search && !query.status && !query.priority ? (
              <Button onClick={() => setCreating(true)}>
                Criar primeira ordem
              </Button>
            ) : undefined
          }
        />
      ) : null}
      {result?.items.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {result.items.map((order) => (
            <article key={order.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {order.number}
                  </p>
                  <h2 className="mt-1 font-heading text-lg font-bold">
                    {order.title}
                  </h2>
                </div>
                <WorkOrderStatusBadge status={order.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {order.description}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm">
                  {priorityLabels[order.priority]}
                </span>
                <Link
                  className={buttonVariants({ variant: 'outline' })}
                  href={`/app/ordens/${order.id}?from=${encodeURIComponent(currentUrl(searchParams))}`}
                >
                  Consultar
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {result && result.total > result.pageSize ? (
        <nav aria-label="Paginação de ordens" className="flex justify-between">
          <PageLink
            query={query}
            page={result.page - 1}
            disabled={result.page <= 1}
          >
            Anterior
          </PageLink>
          <span className="text-sm text-muted-foreground">
            Página {result.page} de {Math.ceil(result.total / result.pageSize)}
          </span>
          <PageLink
            query={query}
            page={result.page + 1}
            disabled={result.page * result.pageSize >= result.total}
          >
            Próxima
          </PageLink>
        </nav>
      ) : null}
    </section>
  )
}

export function readWorkOrderQuery(
  params: URLSearchParams,
): ListWorkOrdersQuery {
  const page = Number(params.get('page'))
  const status = params.get('status')
  const priority = params.get('priority')
  const search = params.get('search')?.trim()
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize,
    ...(search ? { search } : {}),
    ...(workOrderStatuses.includes(status as never)
      ? { status: status as ListWorkOrdersQuery['status'] }
      : {}),
    ...(workOrderPriorities.includes(priority as never)
      ? { priority: priority as ListWorkOrdersQuery['priority'] }
      : {}),
  }
}

export function workOrderListUrl(
  query: ListWorkOrdersQuery,
  page: number,
): string {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (query.search) params.set('search', query.search)
  if (query.status) params.set('status', query.status)
  if (query.priority) params.set('priority', query.priority)
  return `/app/ordens${params.size ? `?${params}` : ''}`
}

function currentUrl(params: URLSearchParams) {
  return `/app/ordens${params.size ? `?${params}` : ''}`
}
function PageLink({
  children,
  disabled,
  page,
  query,
}: {
  children: React.ReactNode
  disabled: boolean
  page: number
  query: ListWorkOrdersQuery
}) {
  return disabled ? (
    <span aria-disabled="true" className="text-sm text-muted-foreground">
      {children}
    </span>
  ) : (
    <Link
      className="text-sm font-semibold text-primary"
      href={workOrderListUrl(query, page)}
    >
      {children}
    </Link>
  )
}
