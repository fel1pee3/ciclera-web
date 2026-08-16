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
import { archiveEquipment, listEquipment, type ListEquipmentQuery } from './api'
import type { EquipmentPage } from './contracts'
import { getEquipmentErrorMessage } from './errors'

const pageSize = 12

export function EquipmentList() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = useMemo(() => readEquipmentQuery(searchParams), [searchParams])
  const [search, setSearch] = useState(query.search ?? '')
  const [result, setResult] = useState<EquipmentPage | null>(null)
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
    void listEquipment(query)
      .then((page) => {
        if (!active) return
        setResult(page)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (active) setError(getEquipmentErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [query, revision])

  const archive = async (equipmentId: string, name: string) => {
    if (!window.confirm(`Arquivar ${name}? O histórico será preservado.`))
      return
    setPendingId(equipmentId)
    setError(null)
    try {
      await archiveEquipment(equipmentId)
      setNotice(`${name} foi arquivado.`)
      setRevision((value) => value + 1)
    } catch (reason) {
      setError(getEquipmentErrorMessage(reason))
    } finally {
      setPendingId(null)
    }
  }

  const currentUrl = equipmentListUrl(query, query.page)

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Ativos atendidos</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">Equipamentos</h1>
          <p className="mt-2 text-muted-foreground">
            Consulte identificação, serial e vínculo de cada ativo.
          </p>
        </div>
        <Link
          href={`/app/equipamentos/novo?from=${encodeURIComponent(currentUrl)}`}
          className={buttonVariants()}
        >
          Novo equipamento
        </Link>
      </div>

      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_14rem_auto]">
        <Label className="grid gap-2">
          <span>Buscar</span>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, identificação ou serial"
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
          href="/app/equipamentos"
        >
          Limpar filtros
        </Link>
      </div>

      {!result && !error ? (
        <div
          className="grid gap-3 sm:grid-cols-2"
          aria-label="Carregando equipamentos"
        >
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : null}

      {result?.items.length === 0 ? (
        <EmptyState
          title={
            query.search
              ? 'Nenhum equipamento encontrado'
              : 'Cadastre o primeiro equipamento'
          }
          description={
            query.search
              ? 'Ajuste a busca ou limpe os filtros.'
              : 'Vincule o primeiro ativo a um cliente e local.'
          }
          action={
            !query.search && query.archive === 'ACTIVE' ? (
              <Link className={buttonVariants()} href="/app/equipamentos/novo">
                Cadastrar equipamento
              </Link>
            ) : undefined
          }
        />
      ) : null}

      {result && result.items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {result.items.map((equipment) => (
            <article
              key={equipment.id}
              className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{equipment.name}</h2>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {equipment.identifier} · {equipment.category}
                  </p>
                </div>
                <Badge variant={equipment.archivedAt ? 'outline' : 'secondary'}>
                  {equipment.archivedAt ? 'Arquivado' : 'Ativo'}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Serial: {equipment.serialNumber ?? 'não informado'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  className={buttonVariants({ variant: 'outline' })}
                  href={`/app/equipamentos/${equipment.id}?from=${encodeURIComponent(currentUrl)}`}
                >
                  Consultar
                </Link>
                {!equipment.archivedAt ? (
                  <Button
                    variant="ghost"
                    disabled={pendingId === equipment.id}
                    onClick={() => void archive(equipment.id, equipment.name)}
                  >
                    {pendingId === equipment.id ? 'Arquivando…' : 'Arquivar'}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {result && result.total > result.pageSize ? (
        <nav
          aria-label="Paginação de equipamentos"
          className="flex items-center justify-between gap-4"
        >
          <PageLink
            disabled={result.page <= 1}
            href={equipmentListUrl(query, result.page - 1)}
          >
            Anterior
          </PageLink>
          <span className="text-sm text-muted-foreground">
            Página {result.page} de {Math.ceil(result.total / result.pageSize)}
          </span>
          <PageLink
            disabled={result.page * result.pageSize >= result.total}
            href={equipmentListUrl(query, result.page + 1)}
          >
            Próxima
          </PageLink>
        </nav>
      ) : null}
    </section>
  )
}

export function readEquipmentQuery(
  params: URLSearchParams,
): ListEquipmentQuery {
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

export function equipmentListUrl(
  query: ListEquipmentQuery,
  page: number,
): string {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (query.search) params.set('search', query.search)
  if (query.archive !== 'ACTIVE') params.set('archive', query.archive)
  return `/app/equipamentos${params.size ? `?${params.toString()}` : ''}`
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
