'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type ComponentProps } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { listCustomers } from '@/features/customers/api'
import type { Customer } from '@/features/customers/contracts'
import { formatMoney } from '@/features/reviews/review-queue'
import {
  downloadBillingCsv,
  listReadyForBilling,
  markWorkOrderBilled,
} from './api'
import type { BillingReadyPage } from './contracts'

const pageSize = 20

export function BillingReadyList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = useMemo(() => parseQuery(searchParams), [searchParams])
  const [result, setResult] = useState<BillingReadyPage | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let active = true
    void Promise.all([
      listReadyForBilling(query),
      listCustomers({ page: 1, pageSize: 100, archive: 'ACTIVE' }),
    ])
      .then(([billing, customerPage]) => {
        if (!active) return
        setResult(billing)
        setCustomers(customerPage.items)
        setError(null)
      })
      .catch(() => active && setError('Não foi possível carregar a fila.'))
    return () => {
      active = false
    }
  }, [query])

  function applyFilters(form: HTMLFormElement) {
    const data = new FormData(form)
    const params = new URLSearchParams()
    setParam(params, 'customerId', data.get('customerId'))
    setDateParam(params, 'completedFrom', data.get('completedFrom'), false)
    setDateParam(params, 'completedTo', data.get('completedTo'), true)
    setParam(params, 'minimumAgingDays', data.get('minimumAgingDays'))
    setMoneyParam(params, 'minimumAmountInCents', data.get('minimumAmount'))
    setMoneyParam(params, 'maximumAmountInCents', data.get('maximumAmount'))
    router.push(`/app/faturamento${params.size ? `?${params}` : ''}`)
  }

  function navigate(page: number) {
    const params = new URLSearchParams(searchParams)
    if (page === 1) params.delete('page')
    else params.set('page', String(page))
    router.push(`/app/faturamento${params.size ? `?${params}` : ''}`)
  }

  async function markBilled(id: string, version: number) {
    if (!window.confirm('Confirma que esta ordem foi faturada externamente?')) {
      return
    }
    setPendingId(id)
    setError(null)
    try {
      await markWorkOrderBilled(id, version)
      setResult((current) =>
        current
          ? {
              ...current,
              items: current.items.filter((item) => item.id !== id),
              total: current.total - 1,
              totalAmountInCents: (
                BigInt(current.totalAmountInCents) -
                BigInt(
                  current.items.find((item) => item.id === id)
                    ?.finalAmountInCents ?? '0',
                )
              ).toString(),
            }
          : current,
      )
      setNotice(
        'Ordem marcada como faturada. Nenhum documento fiscal foi emitido.',
      )
    } catch {
      setError('A ordem foi alterada por outra pessoa. Recarregue a fila.')
    } finally {
      setPendingId(null)
    }
  }

  async function exportCsv() {
    setExporting(true)
    setError(null)
    try {
      const blob = await downloadBillingCsv(query)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'faturamento-pronto.csv'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      setError(
        'Não foi possível exportar a fila. Refine os filtros e tente novamente.',
      )
    } finally {
      setExporting(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="eyebrow">Controle administrativo</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">
          Prontas para faturar
        </h1>
        <p className="mt-2 text-muted-foreground">
          Serviços aprovados para acompanhamento. A Ciclera não emite nota
          fiscal.
        </p>
      </header>
      <Card className="p-5">
        <form
          className="grid gap-4 md:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault()
            applyFilters(event.currentTarget)
          }}
        >
          <Label className="grid gap-2">
            <span>Cliente</span>
            <select
              className="input"
              name="customerId"
              defaultValue={query.customerId}
            >
              <option value="">Todos</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Label>
          <FilterInput
            label="Conclusão desde"
            name="completedFrom"
            type="date"
            defaultValue={displayDate(query.completedFrom)}
          />
          <FilterInput
            label="Conclusão até"
            name="completedTo"
            type="date"
            defaultValue={displayDate(query.completedTo)}
          />
          <FilterInput
            label="Aging mínimo (dias)"
            name="minimumAgingDays"
            type="number"
            min="0"
            defaultValue={query.minimumAgingDays?.toString()}
          />
          <FilterInput
            label="Valor mínimo (R$)"
            name="minimumAmount"
            inputMode="decimal"
            defaultValue={displayMoneyInput(query.minimumAmountInCents)}
          />
          <FilterInput
            label="Valor máximo (R$)"
            name="maximumAmount"
            inputMode="decimal"
            defaultValue={displayMoneyInput(query.maximumAmountInCents)}
          />
          <div className="flex items-end gap-3 md:col-span-3">
            <Button type="submit">Aplicar filtros</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/app/faturamento')}
            >
              Limpar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={exporting}
              onClick={() => void exportCsv()}
            >
              {exporting ? 'Exportando…' : 'Exportar CSV'}
            </Button>
          </div>
        </form>
      </Card>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {!result && !error ? (
        <Skeleton
          className="h-64 rounded-2xl"
          aria-label="Carregando faturamento"
        />
      ) : null}
      {result ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
          <span>{result.total} ordem(ns) no filtro</span>
          <strong className="font-heading text-2xl text-primary">
            {formatMoney(result.totalAmountInCents)}
          </strong>
        </Card>
      ) : null}
      {result?.total === 0 ? (
        <EmptyState
          title="Nenhuma ordem pronta para faturar"
          description="Ordens aprovadas na revisão aparecerão aqui."
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
              <strong>{formatMoney(item.finalAmountInCents)}</strong>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Concluída em {formatDate(item.actualEndAt)} · aprovada em{' '}
              {formatDate(item.approvedAt)}
            </p>
            <Button
              className="mt-5 w-full"
              disabled={pendingId === item.id}
              onClick={() => void markBilled(item.id, item.version)}
            >
              {pendingId === item.id ? 'Registrando…' : 'Marcar como faturada'}
            </Button>
          </Card>
        ))}
      </div>
      {result && result.total > result.pageSize ? (
        <nav
          className="flex justify-between"
          aria-label="Paginação do faturamento"
        >
          <Button
            variant="outline"
            disabled={result.page === 1}
            onClick={() => navigate(result.page - 1)}
          >
            Anterior
          </Button>
          <span>Página {result.page}</span>
          <Button
            variant="outline"
            disabled={result.page * result.pageSize >= result.total}
            onClick={() => navigate(result.page + 1)}
          >
            Próxima
          </Button>
        </nav>
      ) : null}
    </section>
  )
}

function FilterInput({
  label,
  ...props
}: { label: string } & ComponentProps<typeof Input>) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      <Input {...props} />
    </Label>
  )
}

function parseQuery(params: Pick<URLSearchParams, 'get'>) {
  const page = Number(params.get('page'))
  const aging = Number(params.get('minimumAgingDays'))
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize,
    customerId: params.get('customerId') || undefined,
    completedFrom: params.get('completedFrom') || undefined,
    completedTo: params.get('completedTo') || undefined,
    minimumAgingDays: Number.isInteger(aging) && aging >= 0 ? aging : undefined,
    minimumAmountInCents: params.get('minimumAmountInCents') || undefined,
    maximumAmountInCents: params.get('maximumAmountInCents') || undefined,
  }
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: FormDataEntryValue | null,
) {
  if (typeof value === 'string' && value) params.set(key, value)
}

function setDateParam(
  params: URLSearchParams,
  key: string,
  value: FormDataEntryValue | null,
  endOfDay: boolean,
) {
  if (typeof value === 'string' && value)
    params.set(key, `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`)
}

function setMoneyParam(
  params: URLSearchParams,
  key: string,
  value: FormDataEntryValue | null,
) {
  if (typeof value !== 'string' || !value.trim()) return
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return
  const [whole, fraction = ''] = normalized.split('.')
  params.set(
    key,
    (BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, '0'))).toString(),
  )
}

function displayMoneyInput(value?: string) {
  if (!value) return undefined
  const cents = BigInt(value)
  return `${cents / BigInt(100)},${(cents % BigInt(100)).toString().padStart(2, '0')}`
}

function displayDate(value?: string) {
  return value?.slice(0, 10)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}
