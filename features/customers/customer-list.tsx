'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { archiveCustomer, listCustomers, type ListCustomersQuery } from './api'
import type { CustomerPage } from './contracts'
import { getCustomerErrorMessage } from './errors'

const pageSize = 12

export function CustomerList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = useMemo(() => readCustomerQuery(searchParams), [searchParams])
  const [search, setSearch] = useState(query.search ?? '')
  const [result, setResult] = useState<CustomerPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const normalized = search.trim()
      if (normalized === (query.search ?? '')) return
      const next = new URLSearchParams(searchParams.toString())
      next.delete('page')
      if (normalized) next.set('search', normalized)
      else next.delete('search')
      router.replace(`${pathname}${next.size ? `?${next.toString()}` : ''}`)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [pathname, query.search, router, search, searchParams])

  useEffect(() => {
    let active = true
    void listCustomers(query)
      .then((page) => {
        if (!active) return
        setResult(page)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (active) setError(getCustomerErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [query, revision])

  const archive = async (customerId: string, name: string) => {
    if (!window.confirm(`Arquivar ${name}? O histórico será preservado.`))
      return
    setPendingId(customerId)
    setError(null)
    try {
      await archiveCustomer(customerId)
      setNotice(`${name} foi arquivado.`)
      setRevision((value) => value + 1)
    } catch (reason) {
      setError(getCustomerErrorMessage(reason))
    } finally {
      setPendingId(null)
    }
  }

  const currentUrl = customerListUrl(query, query.page)

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Cadastros operacionais</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">Clientes</h1>
          <p className="mt-2 text-muted-foreground">
            Localize empresas atendidas e organize suas unidades.
          </p>
        </div>
        <Link
          href={`/app/clientes/novo?from=${encodeURIComponent(currentUrl)}`}
          className={buttonVariants()}
        >
          Novo cliente
        </Link>
      </div>

      {notice ? (
        <Alert variant="success" role="status">
          {notice}
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive" role="alert">
          {error}
        </Alert>
      ) : null}

      <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_14rem_auto]">
        <Label className="grid gap-2">
          <span>Buscar</span>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome ou documento"
          />
        </Label>
        <Label className="grid gap-2">
          <span>Situação</span>
          <select
            className="input"
            value={query.archive}
            onChange={(event) => {
              const next = new URLSearchParams(searchParams.toString())
              next.delete('page')
              next.set('archive', event.target.value)
              router.replace(`${pathname}?${next.toString()}`)
            }}
          >
            <option value="ACTIVE">Ativos</option>
            <option value="ARCHIVED">Arquivados</option>
            <option value="ALL">Todos</option>
          </select>
        </Label>
        <Link
          className="self-end text-center text-sm font-semibold text-primary"
          href="/app/clientes"
        >
          Limpar filtros
        </Link>
      </div>

      {!result && !error ? (
        <div
          aria-label="Carregando clientes"
          className="grid gap-3 sm:grid-cols-2"
        >
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : null}

      {result?.items.length === 0 ? (
        <EmptyState
          title={
            query.search
              ? 'Nenhum cliente encontrado'
              : 'Cadastre o primeiro cliente'
          }
          description={
            query.search
              ? 'Ajuste a busca ou limpe os filtros.'
              : 'Comece registrando a empresa ou pessoa que receberá o atendimento.'
          }
          action={
            !query.search && query.archive === 'ACTIVE' ? (
              <Link href="/app/clientes/novo" className={buttonVariants()}>
                Cadastrar cliente
              </Link>
            ) : undefined
          }
        />
      ) : null}

      {result && result.items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {result.items.map((customer) => (
            <article
              key={customer.id}
              className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{customer.name}</h2>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {customer.document ??
                      customer.email ??
                      'Sem documento informado'}
                  </p>
                </div>
                <Badge variant={customer.archivedAt ? 'outline' : 'secondary'}>
                  {customer.archivedAt ? 'Arquivado' : 'Ativo'}
                </Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/app/clientes/${customer.id}?from=${encodeURIComponent(currentUrl)}`}
                  className={buttonVariants({ variant: 'outline' })}
                >
                  Consultar
                </Link>
                {!customer.archivedAt ? (
                  <Button
                    variant="ghost"
                    disabled={pendingId === customer.id}
                    onClick={() => void archive(customer.id, customer.name)}
                  >
                    {pendingId === customer.id ? 'Arquivando…' : 'Arquivar'}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {result && result.total > result.pageSize ? (
        <nav
          aria-label="Paginação de clientes"
          className="flex items-center justify-between gap-4"
        >
          <PageLink
            disabled={result.page <= 1}
            href={customerListUrl(query, result.page - 1)}
          >
            Anterior
          </PageLink>
          <span className="text-sm text-muted-foreground">
            Página {result.page} de {Math.ceil(result.total / result.pageSize)}
          </span>
          <PageLink
            disabled={result.page * result.pageSize >= result.total}
            href={customerListUrl(query, result.page + 1)}
          >
            Próxima
          </PageLink>
        </nav>
      ) : null}
    </section>
  )
}

export function readCustomerQuery(params: URLSearchParams): ListCustomersQuery {
  const page = Number(params.get('page'))
  const archive = params.get('archive')
  const search = params.get('search')?.trim()
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize,
    archive: archive === 'ARCHIVED' || archive === 'ALL' ? archive : 'ACTIVE',
    ...(search ? { search } : {}),
  }
}

export function customerListUrl(
  query: ListCustomersQuery,
  page: number,
): string {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (query.search) params.set('search', query.search)
  if (query.archive !== 'ACTIVE') params.set('archive', query.archive)
  return `/app/clientes${params.size ? `?${params.toString()}` : ''}`
}

function PageLink({
  children,
  disabled,
  href,
}: {
  children: React.ReactNode
  disabled: boolean
  href: string
}) {
  return disabled ? (
    <span className="text-sm text-muted-foreground" aria-disabled="true">
      {children}
    </span>
  ) : (
    <Link className="text-sm font-semibold text-primary" href={href}>
      {children}
    </Link>
  )
}
