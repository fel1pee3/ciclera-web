'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type ComponentProps } from 'react'
import {
  CalendarCheck,
  Download,
  Filter,
  ReceiptText,
  WalletCards,
} from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
import type { BillingReadyQuery } from './api'
import type { BillingReadyPage } from './contracts'

const pageSize = 20
type BillingReadyItem = BillingReadyPage['items'][number]

export function BillingReadyList() {
  const searchParams = useSearchParams()
  const initialQuery = useMemo(() => parseQuery(searchParams), [searchParams])
  const [customerId, setCustomerId] = useState(initialQuery.customerId ?? '')
  const [completedFrom, setCompletedFrom] = useState(
    displayDate(initialQuery.completedFrom) ?? '',
  )
  const [completedTo, setCompletedTo] = useState(
    displayDate(initialQuery.completedTo) ?? '',
  )
  const [minimumAgingDays, setMinimumAgingDays] = useState(
    initialQuery.minimumAgingDays?.toString() ?? '',
  )
  const [minimumAmount, setMinimumAmount] = useState(
    displayMoneyInput(initialQuery.minimumAmountInCents) ?? '',
  )
  const [maximumAmount, setMaximumAmount] = useState(
    displayMoneyInput(initialQuery.maximumAmountInCents) ?? '',
  )
  const [debouncedNumericFilters, setDebouncedNumericFilters] = useState({
    minimumAgingDays,
    minimumAmount,
    maximumAmount,
  })
  const [page, setPage] = useState(initialQuery.page)
  const [result, setResult] = useState<BillingReadyPage | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmingItem, setConfirmingItem] = useState<BillingReadyItem | null>(
    null,
  )
  const [exporting, setExporting] = useState(false)
  const query = useMemo<BillingReadyQuery>(
    () => ({
      page,
      pageSize,
      customerId: customerId || undefined,
      completedFrom: toDateFilter(completedFrom, false),
      completedTo: toDateFilter(completedTo, true),
      minimumAgingDays: toAgingFilter(debouncedNumericFilters.minimumAgingDays),
      minimumAmountInCents: toMoneyFilter(
        debouncedNumericFilters.minimumAmount,
      ),
      maximumAmountInCents: toMoneyFilter(
        debouncedNumericFilters.maximumAmount,
      ),
    }),
    [completedFrom, completedTo, customerId, debouncedNumericFilters, page],
  )
  const appliedFilterCount = getAppliedFilterCount(query)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedNumericFilters({
        minimumAgingDays,
        minimumAmount,
        maximumAmount,
      })
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [maximumAmount, minimumAgingDays, minimumAmount])

  useEffect(() => {
    let active = true
    void listReadyForBilling(query)
      .then((billing) => {
        if (!active) return
        setResult(billing)
        setError(null)
      })
      .catch(() => active && setError('Não foi possível carregar a fila.'))
    return () => {
      active = false
    }
  }, [query])

  useEffect(() => {
    let active = true
    void listCustomers({ page: 1, pageSize: 100, archive: 'ACTIVE' })
      .then((customerPage) => {
        if (active) setCustomers(customerPage.items)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar os clientes.')
      })
    return () => {
      active = false
    }
  }, [])

  async function markBilled(item: BillingReadyItem) {
    const { id, version } = item
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
      setConfirmingItem(null)
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
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Controle administrativo</p>
          <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
            Prontas para faturar
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Acompanhe os serviços aprovados e registre o faturamento realizado
            no seu sistema fiscal.
          </p>
        </div>
        <Button
          className="w-full lg:w-auto"
          type="button"
          variant="outline"
          disabled={exporting}
          onClick={() => void exportCsv()}
        >
          <Download aria-hidden="true" />
          {exporting ? 'Exportando…' : 'Exportar CSV'}
        </Button>
      </header>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Filter aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 className="font-heading text-lg font-semibold">
                Refinar faturamento
              </h2>
              <p className="text-sm text-muted-foreground">
                Filtre por cliente, período, tempo de espera ou faixa de valor.
              </p>
            </div>
          </div>
          {appliedFilterCount > 0 ? (
            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {appliedFilterCount}{' '}
              {appliedFilterCount === 1 ? 'filtro ativo' : 'filtros ativos'}
            </span>
          ) : null}
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-12">
            <Label className="grid gap-2 lg:col-span-4">
              <span>Cliente</span>
              <select
                className="input"
                name="customerId"
                value={customerId}
                onChange={(event) => {
                  setCustomerId(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">Todos os clientes</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </Label>
            <FilterInput
              containerClassName="lg:col-span-4"
              label="Concluída a partir de"
              name="completedFrom"
              type="date"
              value={completedFrom}
              onChange={(event) => {
                setCompletedFrom(event.target.value)
                setPage(1)
              }}
            />
            <FilterInput
              containerClassName="lg:col-span-4"
              label="Concluída até"
              name="completedTo"
              type="date"
              value={completedTo}
              onChange={(event) => {
                setCompletedTo(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FilterInput
              label="Aguardando há pelo menos"
              name="minimumAgingDays"
              type="number"
              min="0"
              placeholder="Dias"
              value={minimumAgingDays}
              onChange={(event) => setMinimumAgingDays(event.target.value)}
            />
            <FilterInput
              label="Valor mínimo"
              name="minimumAmount"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={minimumAmount}
              onChange={(event) => setMinimumAmount(event.target.value)}
            />
            <FilterInput
              label="Valor máximo"
              name="maximumAmount"
              inputMode="decimal"
              placeholder="R$ 0,00"
              value={maximumAmount}
              onChange={(event) => setMaximumAmount(event.target.value)}
            />
          </div>
        </div>
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
        <Card className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ReceiptText aria-hidden="true" className="size-6" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                Ordens encontradas
              </p>
              <strong className="font-heading text-2xl">{result.total}</strong>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:justify-end">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <WalletCards aria-hidden="true" className="size-6" />
            </span>
            <div className="sm:text-right">
              <p className="text-sm text-muted-foreground">
                Valor pronto para faturar
              </p>
              <strong className="font-heading text-2xl text-primary sm:text-3xl">
                {formatMoney(result.totalAmountInCents)}
              </strong>
            </div>
          </div>
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
          <Card
            className="flex h-full flex-col overflow-hidden p-0"
            key={item.id}
          >
            <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-wide text-primary">
                    {item.number}
                  </p>
                  <h2 className="mt-1 break-words font-heading text-xl leading-snug font-bold">
                    {item.title}
                  </h2>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Valor final
                  </p>
                  <strong className="mt-1 block font-heading text-xl text-primary">
                    {formatMoney(item.finalAmountInCents)}
                  </strong>
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="font-medium">{item.customer.name}</p>
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <CalendarCheck
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                  <p>
                    Concluída em {formatDate(item.actualEndAt)}
                    <br />
                    Aprovada em {formatDate(item.approvedAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t bg-card p-4 sm:px-6">
              <Button
                className="w-full"
                disabled={pendingId === item.id}
                onClick={() => setConfirmingItem(item)}
              >
                <ReceiptText aria-hidden="true" />
                {pendingId === item.id
                  ? 'Registrando…'
                  : 'Marcar como faturada'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(confirmingItem)}
        title={
          confirmingItem
            ? `Marcar ${confirmingItem.number} como faturada?`
            : 'Marcar ordem como faturada?'
        }
        description={
          confirmingItem
            ? `Confirme que o faturamento de ${formatMoney(confirmingItem.finalAmountInCents)} foi realizado no sistema externo. A Ciclera apenas registrará essa confirmação e não emitirá nota fiscal.`
            : ''
        }
        confirmLabel="Sim, marcar como faturada"
        pendingLabel="Registrando…"
        pending={Boolean(confirmingItem && pendingId === confirmingItem.id)}
        onCancel={() => setConfirmingItem(null)}
        onConfirm={() => {
          if (confirmingItem) void markBilled(confirmingItem)
        }}
      />
      {result && result.total > result.pageSize ? (
        <nav
          className="flex justify-between"
          aria-label="Paginação do faturamento"
        >
          <Button
            variant="outline"
            disabled={result.page === 1}
            onClick={() => setPage(result.page - 1)}
          >
            Anterior
          </Button>
          <span>Página {result.page}</span>
          <Button
            variant="outline"
            disabled={result.page * result.pageSize >= result.total}
            onClick={() => setPage(result.page + 1)}
          >
            Próxima
          </Button>
        </nav>
      ) : null}
    </section>
  )
}

function FilterInput({
  containerClassName,
  label,
  ...props
}: {
  containerClassName?: string
  label: string
} & ComponentProps<typeof Input>) {
  return (
    <Label className={`grid gap-2 ${containerClassName ?? ''}`}>
      <span>{label}</span>
      <Input {...props} />
    </Label>
  )
}

function parseQuery(params: Pick<URLSearchParams, 'get'>) {
  const page = Number(params.get('page'))
  const agingValue = params.get('minimumAgingDays')
  const aging = agingValue === null ? Number.NaN : Number(agingValue)
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

function getAppliedFilterCount(query: BillingReadyQuery) {
  return [
    query.customerId,
    query.completedFrom,
    query.completedTo,
    query.minimumAgingDays,
    query.minimumAmountInCents,
    query.maximumAmountInCents,
  ].filter((value) => value !== undefined).length
}

function toDateFilter(value: string, endOfDay: boolean) {
  if (!value) return undefined
  return `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`
}

function toAgingFilter(value: string) {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined
}

function toMoneyFilter(value: string) {
  const raw = value.trim().replace(/\s|R\$/gi, '')
  if (!raw) return undefined
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return undefined
  const [whole, fraction = ''] = normalized.split('.')
  return (
    BigInt(whole) * BigInt(100) +
    BigInt(fraction.padEnd(2, '0'))
  ).toString()
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
