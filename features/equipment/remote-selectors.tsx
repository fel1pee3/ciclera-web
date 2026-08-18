'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listCustomers, listLocations } from '@/features/customers/api'
import type { CustomerPage, LocationPage } from '@/features/customers/contracts'

const pageSize = 10

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

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      void listCustomers({
        page,
        pageSize,
        archive: 'ACTIVE',
        ...(search.trim() ? { search: search.trim() } : {}),
      }).then((next) => {
        if (active) setResult(next)
      })
    }, 300)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [page, search])

  return (
    <div className="grid gap-2">
      <Input
        aria-label="Buscar cliente"
        placeholder="Digite o nome do cliente"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
        }}
      />
      <select
        aria-label="Cliente"
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Escolha um cliente</option>
        {value && !result?.items.some((item) => item.id === value) ? (
          <option value={value}>Cliente selecionado</option>
        ) : null}
        {result?.items.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </select>
      <SelectorPagination page={page} result={result} onPage={setPage} />
    </div>
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

  useEffect(() => {
    if (!customerId) return
    let active = true
    const timer = window.setTimeout(() => {
      void listLocations(customerId, {
        page,
        pageSize,
        status: 'ACTIVE',
        ...(search.trim() ? { search: search.trim() } : {}),
      }).then((next) => {
        if (active) setResult(next)
      })
    }, 300)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [customerId, page, search])

  return (
    <div className="grid gap-2">
      <Input
        aria-label="Buscar local"
        disabled={!customerId}
        placeholder={
          customerId
            ? 'Digite o nome da unidade'
            : 'Escolha um cliente primeiro'
        }
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
        }}
      />
      <select
        aria-label="Local"
        className="input"
        disabled={!customerId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Escolha um local</option>
        {value && !result?.items.some((item) => item.id === value) ? (
          <option value={value}>Local selecionado</option>
        ) : null}
        {result?.items.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
      {customerId ? (
        <SelectorPagination page={page} result={result} onPage={setPage} />
      ) : null}
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
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Anterior
      </Button>
      <span>Página {page}</span>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={page * result.pageSize >= result.total}
        onClick={() => onPage(page + 1)}
      >
        Próxima
      </Button>
    </div>
  )
}
