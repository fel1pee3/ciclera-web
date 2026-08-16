'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { archiveCustomer, findCustomer, listLocations } from './api'
import type { Customer, LocationPage, ServiceLocation } from './contracts'
import { CustomerForm } from './customer-form'
import { getCustomerErrorMessage } from './errors'
import { LocationForm } from './location-form'

const locationPageSize = 20

export function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>()
  const searchParams = useSearchParams()
  const backHref = useMemo(
    () => safeCustomerReturn(searchParams.get('from')),
    [searchParams],
  )
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [locations, setLocations] = useState<LocationPage | null>(null)
  const [editingCustomer, setEditingCustomer] = useState(false)
  const [editingLocation, setEditingLocation] =
    useState<ServiceLocation | null>(null)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    void Promise.all([
      findCustomer(customerId),
      listLocations(customerId, { page: 1, pageSize: locationPageSize }),
    ])
      .then(([nextCustomer, nextLocations]) => {
        if (!active) return
        setCustomer(nextCustomer)
        setLocations(nextLocations)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (active) setError(getCustomerErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [customerId, revision])

  const archived = async () => {
    if (!customer || !window.confirm(`Arquivar ${customer.name}?`)) return
    try {
      setCustomer(await archiveCustomer(customer.id))
      setNotice(`${customer.name} foi arquivado.`)
    } catch (reason) {
      setError(getCustomerErrorMessage(reason))
    }
  }

  if (!customer && !error) {
    return (
      <Skeleton
        className="mx-auto h-80 max-w-6xl rounded-2xl"
        aria-label="Carregando cliente"
      />
    )
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Link className="text-sm font-semibold text-primary" href={backHref}>
        ← Voltar para clientes
      </Link>
      {error ? (
        <Alert variant="destructive" role="alert">
          {error}
        </Alert>
      ) : null}
      {notice ? (
        <Alert variant="success" role="status">
          {notice}
        </Alert>
      ) : null}

      {customer ? (
        <>
          <header className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">Cliente</p>
                <h1 className="mt-3 break-words font-heading text-3xl font-bold">
                  {customer.name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {customer.document ?? 'Documento não informado'}
                </p>
              </div>
              <Badge variant={customer.archivedAt ? 'outline' : 'secondary'}>
                {customer.archivedAt ? 'Arquivado' : 'Ativo'}
              </Badge>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">E-mail</dt>
                <dd>{customer.email ?? 'Não informado'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Telefone</dt>
                <dd>{customer.phone ?? 'Não informado'}</dd>
              </div>
            </dl>
            {customer.notes ? (
              <p className="mt-4 whitespace-pre-wrap text-sm">
                {customer.notes}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingCustomer(true)}
              >
                Editar
              </Button>
              {!customer.archivedAt ? (
                <Button variant="ghost" onClick={() => void archived()}>
                  Arquivar
                </Button>
              ) : null}
            </div>
          </header>

          {editingCustomer ? (
            <CustomerForm
              customer={customer}
              onCancel={() => setEditingCustomer(false)}
              onSaved={(updated) => {
                setCustomer(updated)
                setEditingCustomer(false)
                setNotice('Cliente atualizado.')
              }}
            />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-bold">
                Locais de atendimento
              </h2>
              <p className="text-sm text-muted-foreground">
                Unidades vinculadas a este cliente.
              </p>
            </div>
            {!customer.archivedAt ? (
              <Button onClick={() => setShowLocationForm(true)}>
                Adicionar local
              </Button>
            ) : null}
          </div>

          {showLocationForm ? (
            <LocationForm
              customerId={customer.id}
              onCancel={() => setShowLocationForm(false)}
              onSaved={(location) => {
                setShowLocationForm(false)
                setNotice(`${location.name} foi adicionado.`)
                setRevision((value) => value + 1)
              }}
            />
          ) : null}
          {editingLocation ? (
            <LocationForm
              customerId={customer.id}
              location={editingLocation}
              onCancel={() => setEditingLocation(null)}
              onSaved={(location) => {
                setEditingLocation(null)
                setNotice(`${location.name} foi atualizado.`)
                setRevision((value) => value + 1)
              }}
            />
          ) : null}

          {locations?.items.length === 0 ? (
            <EmptyState
              title="Nenhum local cadastrado"
              description="Adicione a primeira unidade onde os serviços serão realizados."
            />
          ) : null}
          {locations && locations.items.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {locations.items.map((location) => (
                <article
                  key={location.id}
                  className="rounded-2xl border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{location.name}</h3>
                    <Badge
                      variant={
                        location.status === 'ACTIVE' ? 'secondary' : 'outline'
                      }
                    >
                      {location.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <address className="mt-3 not-italic text-sm text-muted-foreground">
                    {location.street}, {location.number}
                    <br />
                    {location.neighborhood} — {location.city}/{location.state}
                    <br />
                    CEP {location.postalCode}
                  </address>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => setEditingLocation(location)}
                  >
                    Editar local
                  </Button>
                </article>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

export function NewCustomer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const backHref = safeCustomerReturn(searchParams.get('from'))
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Link className="text-sm font-semibold text-primary" href={backHref}>
        ← Voltar para clientes
      </Link>
      <div>
        <p className="eyebrow">Cadastros operacionais</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Novo cliente</h1>
      </div>
      <CustomerForm
        onSaved={(customer) =>
          router.push(
            `/app/clientes/${customer.id}?from=${encodeURIComponent(backHref)}`,
          )
        }
      />
    </section>
  )
}

export function safeCustomerReturn(value: string | null): string {
  return value?.startsWith('/app/clientes') && !value.startsWith('//')
    ? value
    : '/app/clientes'
}
