'use client'

import {
  Archive,
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import {
  archiveCustomer,
  findCustomer,
  listLocations,
  reactivateCustomer,
} from './api'
import type { Customer, LocationPage, ServiceLocation } from './contracts'
import { CustomerForm } from './customer-form'
import { getCustomerErrorMessage } from './errors'
import { displayDocument, displayPhone, formatPostalCode } from './formatters'
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
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [reactivating, setReactivating] = useState(false)
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
    if (!customer) return
    setArchiving(true)
    try {
      setCustomer(await archiveCustomer(customer.id))
      setNotice(`${customer.name} foi arquivado.`)
      setArchiveOpen(false)
    } catch (reason) {
      setError(getCustomerErrorMessage(reason))
    } finally {
      setArchiving(false)
    }
  }

  const reactivate = async () => {
    if (!customer) return
    setReactivating(true)
    try {
      setCustomer(await reactivateCustomer(customer.id))
      setNotice(`${customer.name} foi reativado.`)
      setReactivateOpen(false)
    } catch (reason) {
      setError(getCustomerErrorMessage(reason))
    } finally {
      setReactivating(false)
    }
  }

  const closeLocationModal = () => {
    setShowLocationForm(false)
    setEditingLocation(null)
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
          <header className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="flex flex-col gap-5 border-b bg-gradient-to-br from-primary/[0.08] via-card to-card p-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
                  <Building2 aria-hidden="true" className="size-6" />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow">Cadastro do cliente</p>
                  <h1 className="mt-2 break-words font-heading text-3xl font-bold">
                    {customer.name}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {displayDocument(customer.document) ??
                      'Documento não informado'}
                  </p>
                </div>
              </div>
              <Badge variant={customer.archivedAt ? 'outline' : 'secondary'}>
                {customer.archivedAt ? 'Arquivado' : 'Ativo'}
              </Badge>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <DetailItem
                icon={<Mail aria-hidden="true" />}
                label="E-mail"
                value={customer.email ?? 'Não informado'}
              />
              <DetailItem
                icon={<Phone aria-hidden="true" />}
                label="Telefone"
                value={displayPhone(customer.phone) ?? 'Não informado'}
              />
              <div className="rounded-2xl bg-muted/45 p-4 md:col-span-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Observações operacionais
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {customer.notes ?? 'Nenhuma observação informada.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t bg-muted/20 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => setEditingCustomer(true)}
              >
                <Pencil aria-hidden="true" />
                Editar dados
              </Button>
              {!customer.archivedAt ? (
                <Button
                  variant="destructive"
                  onClick={() => setArchiveOpen(true)}
                >
                  <Archive aria-hidden="true" />
                  Arquivar cliente
                </Button>
              ) : (
                <Button onClick={() => setReactivateOpen(true)}>
                  Reativar cliente
                </Button>
              )}
            </div>
          </header>

          <Modal
            open={editingCustomer}
            onClose={() => setEditingCustomer(false)}
            title="Editar dados do cliente"
            description="Atualize a identificação, os contatos e as observações operacionais."
          >
            <CustomerForm
              embedded
              customer={customer}
              onCancel={() => setEditingCustomer(false)}
              onSaved={(updated) => {
                setCustomer(updated)
                setEditingCustomer(false)
                setNotice('Cliente atualizado.')
              }}
            />
          </Modal>

          <ConfirmDialog
            open={archiveOpen}
            title="Arquivar cliente?"
            description={`${customer.name} deixará de aparecer entre os clientes ativos. O cadastro, os locais e o histórico serão preservados; nenhum dado será excluído.`}
            confirmLabel="Arquivar cliente"
            pendingLabel="Arquivando…"
            variant="destructive"
            pending={archiving}
            onCancel={() => setArchiveOpen(false)}
            onConfirm={() => void archived()}
          />

          <ConfirmDialog
            open={reactivateOpen}
            title="Reativar cliente?"
            description={`${customer.name} voltará para os clientes ativos e poderá receber novos locais e operações.`}
            confirmLabel="Reativar cliente"
            pendingLabel="Reativando…"
            pending={reactivating}
            onCancel={() => setReactivateOpen(false)}
            onConfirm={() => void reactivate()}
          />

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
              <Button
                onClick={() => {
                  setEditingLocation(null)
                  setShowLocationForm(true)
                }}
              >
                <Plus aria-hidden="true" />
                Adicionar local
              </Button>
            ) : null}
          </div>

          <Modal
            className="sm:max-w-4xl"
            open={showLocationForm || Boolean(editingLocation)}
            onClose={closeLocationModal}
            title={editingLocation ? 'Editar local' : 'Adicionar local'}
            description={
              editingLocation
                ? 'Atualize o endereço, o contato e as orientações desta unidade.'
                : 'Cadastre uma unidade onde os serviços deste cliente serão realizados.'
            }
          >
            {showLocationForm || editingLocation ? (
              <LocationForm
                key={editingLocation?.id ?? 'new-location'}
                embedded
                customerId={customer.id}
                location={editingLocation ?? undefined}
                onCancel={closeLocationModal}
                onSaved={(location) => {
                  const wasEditing = Boolean(editingLocation)
                  closeLocationModal()
                  setNotice(
                    `${location.name} foi ${wasEditing ? 'atualizado' : 'adicionado'}.`,
                  )
                  setRevision((value) => value + 1)
                }}
              />
            ) : null}
          </Modal>

          {locations?.items.length === 0 ? (
            <EmptyState
              title="Nenhum local cadastrado"
              description="Adicione a primeira unidade onde os serviços serão realizados."
            />
          ) : null}
          {locations && locations.items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {locations.items.map((location) => (
                <article
                  key={location.id}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3 border-b p-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                          Unidade de atendimento
                        </p>
                        <h3 className="mt-1 break-words font-semibold">
                          {location.name}
                        </h3>
                      </div>
                    </div>
                    <Badge
                      className="shrink-0"
                      variant={
                        location.status === 'ACTIVE' ? 'secondary' : 'outline'
                      }
                    >
                      {location.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <address className="not-italic text-sm leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {location.street}, {location.number}
                      </span>
                      {location.complement ? ` — ${location.complement}` : ''}
                      <br />
                      {location.neighborhood} — {location.city}/{location.state}
                      <br />
                      CEP {formatPostalCode(location.postalCode)} ·{' '}
                      {location.country}
                    </address>

                    {location.contactName || location.contactPhone ? (
                      <div className="grid gap-1 rounded-xl bg-muted/45 p-3 text-sm">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Contato local
                        </p>
                        <p>{location.contactName ?? 'Não informado'}</p>
                        {location.contactPhone ? (
                          <p className="text-muted-foreground">
                            {displayPhone(location.contactPhone)}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {location.accessInstructions ? (
                      <div className="text-sm">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          Instruções de acesso
                        </p>
                        <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                          {location.accessInstructions}
                        </p>
                      </div>
                    ) : null}

                    <Button
                      className="mt-auto self-start"
                      variant="outline"
                      onClick={() => {
                        setShowLocationForm(false)
                        setEditingLocation(location)
                      }}
                    >
                      <Pencil aria-hidden="true" />
                      Editar local
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export function NewCustomer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const backHref = safeCustomerReturn(searchParams.get('from'))
  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Link
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-2.5 hover:underline"
        href={backHref}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para clientes
      </Link>
      <div className="max-w-2xl">
        <p className="eyebrow">Cadastros operacionais</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Novo cliente</h1>
        <p className="mt-2 text-muted-foreground">
          Cadastre a empresa ou pessoa atendida antes de adicionar seus locais e
          equipamentos.
        </p>
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
