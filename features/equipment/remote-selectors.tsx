'use client'

import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  MapPin,
  Search,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listCustomers, listLocations } from '@/features/customers/api'
import type {
  Customer,
  CustomerPage,
  LocationPage,
  ServiceLocation,
} from '@/features/customers/contracts'

const pageSize = 10

interface SelectedOption {
  id: string
  title: string
  description: string
}

export function RemoteCustomerSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (customerId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<CustomerPage | null>(null)
  const [selected, setSelected] = useState<SelectedOption | null>(null)
  const [choosing, setChoosing] = useState(!value)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      void listCustomers({
        page,
        pageSize,
        archive: 'ACTIVE',
        ...(search.trim() ? { search: search.trim() } : {}),
      })
        .then((next) => {
          if (!active) return
          setResult(next)
          setError(null)
          const current = next.items.find((item) => item.id === value)
          if (current) setSelected(customerOption(current))
        })
        .catch(() => {
          if (active) {
            setError('Não foi possível carregar os clientes.')
            setResult(null)
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 250)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [page, search, value])

  if (value && !choosing) {
    return (
      <SelectedChoice
        icon={<Building2 aria-hidden="true" className="size-5" />}
        label="Cliente selecionado"
        option={
          selected ?? {
            id: value,
            title: 'Cliente selecionado',
            description: 'Cadastro vinculado ao equipamento',
          }
        }
        changeLabel="Alterar cliente"
        onChange={() => setChoosing(true)}
      />
    )
  }

  return (
    <SelectorSearch
      search={search}
      searchLabel="Buscar cliente"
      placeholder="Busque por nome ou documento"
      loading={loading}
      error={error}
      empty={!loading && !error && result?.items.length === 0}
      emptyMessage="Nenhum cliente ativo encontrado."
      page={page}
      result={result}
      onPage={setPage}
      onSearch={(next) => {
        setSearch(next)
        setPage(1)
      }}
    >
      {result?.items.map((customer) => {
        const option = customerOption(customer)
        return (
          <ResultOption
            key={customer.id}
            selected={customer.id === value}
            title={option.title}
            description={option.description}
            ariaLabel={`Selecionar cliente ${customer.name}`}
            onClick={() => {
              setSelected(option)
              setChoosing(false)
              setSearch('')
              onChange(customer.id)
            }}
          />
        )
      })}
    </SelectorSearch>
  )
}

export function RemoteLocationSelector({
  customerId,
  value,
  onChange,
}: {
  customerId: string
  value: string
  onChange: (locationId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<LocationPage | null>(null)
  const [selected, setSelected] = useState<SelectedOption | null>(null)
  const [choosing, setChoosing] = useState(!value)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!customerId) return
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      void listLocations(customerId, {
        page,
        pageSize,
        status: 'ACTIVE',
        ...(search.trim() ? { search: search.trim() } : {}),
      })
        .then((next) => {
          if (!active) return
          setResult(next)
          setError(null)
          const current = next.items.find((item) => item.id === value)
          if (current) setSelected(locationOption(current))
        })
        .catch(() => {
          if (active) {
            setError('Não foi possível carregar os locais.')
            setResult(null)
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 250)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [customerId, page, search, value])

  if (!customerId) {
    return (
      <div className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed bg-card/60 px-4 py-3 text-muted-foreground">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
          <MapPin aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Aguardando o cliente
          </p>
          <p className="mt-0.5 text-xs leading-relaxed">
            Escolha um cliente para visualizar suas unidades ativas.
          </p>
        </div>
      </div>
    )
  }

  if (value && !choosing) {
    return (
      <SelectedChoice
        icon={<MapPin aria-hidden="true" className="size-5" />}
        label="Local selecionado"
        option={
          selected ?? {
            id: value,
            title: 'Local selecionado',
            description: 'Unidade vinculada ao equipamento',
          }
        }
        changeLabel="Alterar local"
        onChange={() => setChoosing(true)}
      />
    )
  }

  return (
    <SelectorSearch
      search={search}
      searchLabel="Buscar local"
      placeholder="Busque pelo nome da unidade"
      loading={loading}
      error={error}
      empty={!loading && !error && result?.items.length === 0}
      emptyMessage="Nenhum local ativo encontrado para este cliente."
      page={page}
      result={result}
      onPage={setPage}
      onSearch={(next) => {
        setSearch(next)
        setPage(1)
      }}
    >
      {result?.items.map((location) => {
        const option = locationOption(location)
        return (
          <ResultOption
            key={location.id}
            selected={location.id === value}
            title={option.title}
            description={option.description}
            ariaLabel={`Selecionar local ${location.name}`}
            onClick={() => {
              setSelected(option)
              setChoosing(false)
              setSearch('')
              onChange(location.id)
            }}
          />
        )
      })}
    </SelectorSearch>
  )
}

function SelectorSearch({
  children,
  search,
  searchLabel,
  placeholder,
  loading,
  error,
  empty,
  emptyMessage,
  page,
  result,
  onPage,
  onSearch,
}: {
  children: React.ReactNode
  search: string
  searchLabel: string
  placeholder: string
  loading: boolean
  error: string | null
  empty: boolean
  emptyMessage: string
  page: number
  result: { pageSize: number; total: number } | null
  onPage: (page: number) => void
  onSearch: (search: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow focus-within:border-primary/30 focus-within:shadow-md">
      <div className="relative border-b">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label={searchLabel}
          className="rounded-none border-0 bg-transparent pl-10 pr-11 shadow-none focus-visible:ring-0"
          placeholder={placeholder}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
        {search ? (
          <>
            <span
              aria-hidden="true"
              className="absolute right-10 top-1/2 h-5 w-px -translate-y-1/2 bg-border"
            />
            <button
              type="button"
              aria-label={`Limpar ${searchLabel.toLocaleLowerCase('pt-BR')}`}
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-primary focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onSearch('')}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : null}
      </div>

      <div className="max-h-56 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Carregando opções…
          </div>
        ) : null}
        {!loading && error ? (
          <p className="px-3 py-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {!loading && !error ? children : null}
        {empty ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : null}
      </div>

      <SelectorPagination page={page} result={result} onPage={onPage} />
    </div>
  )
}

function ResultOption({
  selected,
  title,
  description,
  ariaLabel,
  onClick,
}: {
  selected: boolean
  title: string
  description: string
  ariaLabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      onClick={onClick}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        {selected ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <span aria-hidden="true" className="size-2 rounded-full bg-border" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  )
}

function SelectedChoice({
  icon,
  label,
  option,
  changeLabel,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  option: SelectedOption
  changeLabel: string
  onChange: () => void
}) {
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3 shadow-sm">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {option.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {option.description}
        </p>
      </div>
      <Button
        className="shrink-0"
        type="button"
        size="sm"
        variant="outline"
        aria-label={changeLabel}
        onClick={onChange}
      >
        Alterar
      </Button>
    </div>
  )
}

function SelectorPagination({
  page,
  result,
  onPage,
}: {
  page: number
  result: { pageSize: number; total: number } | null
  onPage: (page: number) => void
}) {
  if (!result || result.total <= result.pageSize) return null
  const totalPages = Math.ceil(result.total / result.pageSize)
  return (
    <div className="flex items-center justify-between gap-2 border-t bg-muted/20 px-2 py-1.5 text-xs text-muted-foreground">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={page <= 1}
        aria-label="Página anterior"
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </Button>
      <span>
        Página {page} de {totalPages}
      </span>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={page >= totalPages}
        aria-label="Próxima página"
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  )
}

function customerOption(customer: Customer): SelectedOption {
  return {
    id: customer.id,
    title: customer.name,
    description: customer.document ?? customer.email ?? 'Cliente ativo',
  }
}

function locationOption(location: ServiceLocation): SelectedOption {
  const address = [location.city, location.state].filter(Boolean).join('/')
  return {
    id: location.id,
    title: location.name,
    description: address || 'Local de atendimento ativo',
  }
}
