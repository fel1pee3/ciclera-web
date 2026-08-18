'use client'

import {
  Archive,
  Barcode,
  Box,
  Building2,
  CalendarClock,
  ClipboardList,
  Factory,
  MapPin,
  Pencil,
  Tag,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { findCustomer, findLocation } from '@/features/customers/api'
import type { Customer, ServiceLocation } from '@/features/customers/contracts'
import { listWorkOrders } from '@/features/work-orders/api'
import type { WorkOrder, WorkOrderPage } from '@/features/work-orders/contracts'
import { WorkOrderStatusBadge } from '@/features/work-orders/status-badge'
import { archiveEquipment, findEquipment, reactivateEquipment } from './api'
import type { Equipment } from './contracts'
import { EquipmentForm } from './equipment-form'
import { getEquipmentErrorMessage } from './errors'

const historyPageSize = 6

export function EquipmentDetail() {
  const { equipmentId } = useParams<{ equipmentId: string }>()
  const searchParams = useSearchParams()
  const backHref = useMemo(
    () => safeEquipmentReturn(searchParams.get('from')),
    [searchParams],
  )
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [location, setLocation] = useState<ServiceLocation | null>(null)
  const [workOrderHistory, setWorkOrderHistory] =
    useState<WorkOrderPage | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [reactivating, setReactivating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void findEquipment(equipmentId)
      .then(async (nextEquipment) => {
        const [nextCustomer, nextLocation] = await Promise.all([
          findCustomer(nextEquipment.customerId),
          findLocation(nextEquipment.locationId),
        ])
        if (!active) return
        setEquipment(nextEquipment)
        setCustomer(nextCustomer)
        setLocation(nextLocation)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (active) setError(getEquipmentErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [equipmentId])

  useEffect(() => {
    let active = true
    void listWorkOrders({
      page: historyPage,
      pageSize: historyPageSize,
      equipmentId,
    })
      .then((page) => {
        if (!active) return
        setWorkOrderHistory(page)
        setHistoryError(null)
      })
      .catch(() => {
        if (!active) return
        setHistoryError(
          'Não foi possível carregar o histórico técnico deste equipamento.',
        )
      })
    return () => {
      active = false
    }
  }, [equipmentId, historyPage])

  const archive = async () => {
    if (!equipment) return
    setArchiving(true)
    try {
      setEquipment(await archiveEquipment(equipment.id))
      setNotice(`${equipment.name} foi arquivado.`)
      setArchiveOpen(false)
    } catch (reason) {
      setError(getEquipmentErrorMessage(reason))
    } finally {
      setArchiving(false)
    }
  }

  const reactivate = async () => {
    if (!equipment) return
    setReactivating(true)
    try {
      setEquipment(await reactivateEquipment(equipment.id))
      setNotice(`${equipment.name} foi reativado.`)
      setReactivateOpen(false)
    } catch (reason) {
      setError(getEquipmentErrorMessage(reason))
    } finally {
      setReactivating(false)
    }
  }

  if (!equipment && !error) {
    return (
      <Skeleton
        className="mx-auto h-80 max-w-6xl rounded-2xl"
        aria-label="Carregando equipamento"
      />
    )
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Link className="text-sm font-semibold text-primary" href={backHref}>
        ← Voltar para equipamentos
      </Link>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}

      {equipment ? (
        <>
          <header className="overflow-hidden rounded-3xl border bg-card shadow-sm">
            <div className="flex flex-col gap-5 border-b bg-gradient-to-br from-primary/[0.08] via-card to-card p-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
                  <Wrench aria-hidden="true" className="size-6" />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow">Cadastro do equipamento</p>
                  <h1 className="mt-2 break-words font-heading text-3xl font-bold">
                    {equipment.name}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {equipment.identifier} · {equipment.category}
                  </p>
                </div>
              </div>
              <Badge variant={equipment.archivedAt ? 'outline' : 'secondary'}>
                {equipment.archivedAt ? 'Arquivado' : 'Ativo'}
              </Badge>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.4fr]">
              <section className="rounded-2xl bg-primary/[0.06] p-4">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                  Onde está instalado
                </p>
                <div className="mt-4 space-y-4">
                  <EquipmentInfo
                    icon={<Building2 aria-hidden="true" />}
                    label="Cliente"
                    value={customer?.name ?? 'Carregando…'}
                  />
                  <EquipmentInfo
                    icon={<MapPin aria-hidden="true" />}
                    label="Local de atendimento"
                    value={location?.name ?? 'Carregando…'}
                  />
                </div>
              </section>

              <section>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Dados técnicos
                </p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <EquipmentInfo
                    icon={<Tag aria-hidden="true" />}
                    label="Identificação interna"
                    value={equipment.identifier}
                  />
                  <EquipmentInfo
                    icon={<Box aria-hidden="true" />}
                    label="Categoria"
                    value={equipment.category}
                  />
                  <EquipmentInfo
                    icon={<Factory aria-hidden="true" />}
                    label="Marca"
                    value={equipment.brand ?? 'Não informada'}
                  />
                  <EquipmentInfo
                    icon={<Wrench aria-hidden="true" />}
                    label="Modelo"
                    value={equipment.model ?? 'Não informado'}
                  />
                  <EquipmentInfo
                    icon={<Barcode aria-hidden="true" />}
                    label="Número de série"
                    value={equipment.serialNumber ?? 'Não informado'}
                  />
                </div>
              </section>

              <div className="rounded-2xl bg-muted/45 p-4 lg:col-span-2">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Observações técnicas
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                  {equipment.notes ?? 'Nenhuma observação informada.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t bg-muted/20 px-6 py-4">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true" />
                Editar dados
              </Button>
              {!equipment.archivedAt ? (
                <Button
                  variant="destructive"
                  onClick={() => setArchiveOpen(true)}
                >
                  <Archive aria-hidden="true" />
                  Arquivar equipamento
                </Button>
              ) : (
                <Button onClick={() => setReactivateOpen(true)}>
                  Reativar equipamento
                </Button>
              )}
            </div>
          </header>

          <Modal
            className="sm:max-w-4xl"
            open={editing}
            onClose={() => setEditing(false)}
            title="Editar equipamento"
            description="Atualize o vínculo e os dados técnicos deste equipamento."
          >
            <EquipmentForm
              embedded
              equipment={equipment}
              onCancel={() => setEditing(false)}
              onSaved={(updated) => {
                setEquipment(updated)
                setEditing(false)
                setNotice('Equipamento atualizado.')
                void Promise.all([
                  findCustomer(updated.customerId),
                  findLocation(updated.locationId),
                ]).then(([nextCustomer, nextLocation]) => {
                  setCustomer(nextCustomer)
                  setLocation(nextLocation)
                })
              }}
            />
          </Modal>

          <ConfirmDialog
            open={archiveOpen}
            title="Arquivar equipamento?"
            description={`${equipment.name} deixará de aparecer entre os equipamentos ativos. O cadastro e todo o histórico técnico serão preservados; nenhum dado será excluído.`}
            confirmLabel="Arquivar equipamento"
            pendingLabel="Arquivando…"
            variant="destructive"
            pending={archiving}
            onCancel={() => setArchiveOpen(false)}
            onConfirm={() => void archive()}
          />

          <ConfirmDialog
            open={reactivateOpen}
            title="Reativar equipamento?"
            description={`${equipment.name} voltará para os equipamentos ativos e poderá ser utilizado em novas ordens.`}
            confirmLabel="Reativar equipamento"
            pendingLabel="Reativando…"
            pending={reactivating}
            onCancel={() => setReactivateOpen(false)}
            onConfirm={() => void reactivate()}
          />

          <section className="space-y-4" aria-labelledby="equipment-history">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="equipment-history"
                  className="font-heading text-2xl font-bold"
                >
                  Histórico técnico
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ordens de serviço vinculadas a este equipamento, da mais
                  recente para a mais antiga.
                </p>
              </div>
              {workOrderHistory?.total ? (
                <Badge variant="outline">
                  {workOrderHistory.total}{' '}
                  {workOrderHistory.total === 1 ? 'ordem' : 'ordens'}
                </Badge>
              ) : null}
            </div>

            {historyError ? (
              <Alert variant="destructive">{historyError}</Alert>
            ) : null}
            {!workOrderHistory && !historyError ? (
              <Skeleton
                className="h-52 rounded-2xl"
                aria-label="Carregando histórico técnico"
              />
            ) : null}
            {workOrderHistory?.total === 0 ? (
              <EmptyState
                title="Nenhum atendimento registrado"
                description="Crie uma ordem de serviço e selecione este equipamento para que ela apareça no histórico técnico."
              />
            ) : null}
            {workOrderHistory?.items.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {workOrderHistory.items.map((order) => (
                  <EquipmentHistoryCard key={order.id} order={order} />
                ))}
              </div>
            ) : null}
            {workOrderHistory &&
            workOrderHistory.total > workOrderHistory.pageSize ? (
              <nav
                aria-label="Paginação do histórico técnico"
                className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <Button
                  variant="outline"
                  disabled={workOrderHistory.page <= 1}
                  onClick={() => {
                    setWorkOrderHistory(null)
                    setHistoryPage((current) => Math.max(1, current - 1))
                  }}
                >
                  Anterior
                </Button>
                <span className="text-center text-sm text-muted-foreground">
                  Página {workOrderHistory.page} de{' '}
                  {Math.ceil(
                    workOrderHistory.total / workOrderHistory.pageSize,
                  )}
                </span>
                <Button
                  variant="outline"
                  disabled={
                    workOrderHistory.page * workOrderHistory.pageSize >=
                    workOrderHistory.total
                  }
                  onClick={() => {
                    setWorkOrderHistory(null)
                    setHistoryPage((current) => current + 1)
                  }}
                >
                  Próxima
                </Button>
              </nav>
            ) : null}
          </section>
        </>
      ) : null}
    </section>
  )
}

export function NewEquipment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const backHref = safeEquipmentReturn(searchParams.get('from'))
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Link className="text-sm font-semibold text-primary" href={backHref}>
        ← Voltar para equipamentos
      </Link>
      <div>
        <p className="eyebrow">Ativos atendidos</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">
          Novo equipamento
        </h1>
      </div>
      <EquipmentForm
        onSaved={(equipment) =>
          router.push(
            `/app/equipamentos/${equipment.id}?from=${encodeURIComponent(backHref)}`,
          )
        }
      />
    </section>
  )
}

export function safeEquipmentReturn(value: string | null): string {
  return value?.startsWith('/app/equipamentos') && !value.startsWith('//')
    ? value
    : '/app/equipamentos'
}

function EquipmentInfo({
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

function EquipmentHistoryCard({ order }: { order: WorkOrder }) {
  const date = workOrderReferenceDate(order)

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b bg-muted/20 p-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">{order.number}</p>
          <h3 className="mt-1 break-words font-heading text-lg font-bold">
            {order.title}
          </h3>
        </div>
        <WorkOrderStatusBadge status={order.status} />
      </div>
      <div className="space-y-4 p-5">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <ClipboardList
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Tipo de serviço
              </p>
              <p className="mt-1 font-medium">{order.serviceType}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarClock
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {date.label}
              </p>
              <p className="mt-1 font-medium">
                {formatHistoryDate(date.value)}
              </p>
            </div>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {order.description}
        </p>
        <div className="flex justify-end border-t pt-4">
          <Link
            className={buttonVariants({ variant: 'outline' })}
            href={`/app/ordens/${order.id}`}
          >
            Ver ordem
          </Link>
        </div>
      </div>
    </article>
  )
}

function workOrderReferenceDate(order: WorkOrder) {
  if (order.actualEndAt) {
    return { label: 'Concluída em', value: order.actualEndAt }
  }
  if (order.scheduledStartAt) {
    return { label: 'Agendada para', value: order.scheduledStartAt }
  }
  return { label: 'Criada em', value: order.createdAt }
}

function formatHistoryDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}
