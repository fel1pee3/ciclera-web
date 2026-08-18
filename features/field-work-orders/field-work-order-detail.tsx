'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileText,
  MapPin,
  Play,
  Wrench,
} from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/features/auth/session-provider'
import { WorkOrderStatusBadge } from '@/features/work-orders/status-badge'
import { findFieldWorkOrder, startFieldWorkOrder } from './api'
import type { FieldWorkOrder } from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'
import { cn } from '@/lib/utils'

const priorityLabels = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
} as const

export function FieldWorkOrderDetail() {
  const { account } = useSession()
  const router = useRouter()
  const { workOrderId } = useParams<{ workOrderId: string }>()
  const searchParams = useSearchParams()
  const backHref = useMemo(
    () => safeFieldReturn(searchParams.get('from')),
    [searchParams],
  )
  const [order, setOrder] = useState<FieldWorkOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmingStart, setConfirmingStart] = useState(false)
  const [starting, setStarting] = useState(false)
  useEffect(() => {
    let active = true
    void findFieldWorkOrder(workOrderId)
      .then((value) => {
        if (active) setOrder(value)
      })
      .catch((reason: unknown) => {
        if (active) setError(getFieldWorkOrderErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [workOrderId])

  async function start() {
    if (!order || order.status !== 'SCHEDULED') return
    setStarting(true)
    setError(null)
    try {
      const updated = await startFieldWorkOrder(order.id, order.version)
      setOrder(updated)
      setConfirmingStart(false)
      router.push(`/field/ordens/${order.id}/executar`)
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
      setConfirmingStart(false)
    } finally {
      setStarting(false)
    }
  }
  if (!order && !error)
    return (
      <Skeleton
        className="h-96 rounded-2xl"
        aria-label="Carregando atendimento"
      />
    )
  return (
    <section className="space-y-6">
      <Link
        className="inline-flex min-h-11 items-center gap-2 rounded-xl font-semibold text-primary transition hover:text-primary/75"
        href={backHref}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar para minhas ordens
      </Link>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {order ? (
        <>
          <Card className="overflow-hidden p-0">
            <div className="p-5 sm:p-7">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <p className="eyebrow">{order.number}</p>
                  <h1 className="mt-2 break-words font-heading text-2xl leading-tight font-bold sm:text-3xl">
                    {order.title}
                  </h1>
                </div>
                <WorkOrderStatusBadge status={order.status} />
              </div>
            </div>

            <div className="grid gap-4 border-t bg-muted/30 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-7">
              <div className="flex items-start gap-3">
                <CalendarClock
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Horário programado
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatSchedule(order, account?.organization.timezone)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Prioridade
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {priorityLabels[order.priority]}
                </p>
              </div>
            </div>
          </Card>

          {order.currentCorrection ? (
            <Alert variant="destructive">
              <p className="font-semibold">Correção solicitada</p>
              <p className="mt-1">{order.currentCorrection.description}</p>
            </Alert>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText aria-hidden="true" className="size-5" />
                </span>
                <h2 className="font-heading text-lg font-semibold">
                  Orientações do serviço
                </h2>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {order.description}
              </p>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 aria-hidden="true" className="size-5" />
                </span>
                <h2 className="font-heading text-lg font-semibold">
                  Cliente e local
                </h2>
              </div>
              <dl className="mt-5 space-y-4 text-sm">
                <Data label="Cliente" value={order.customer.name} />
                <Data label="Unidade" value={order.location.name} />
                <Data
                  icon={<MapPin aria-hidden="true" className="size-4" />}
                  label="Endereço"
                  value={address(order.location)}
                />
              </dl>
            </Card>

            <Card className="p-5 sm:p-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Wrench aria-hidden="true" className="size-5" />
                </span>
                <h2 className="font-heading text-lg font-semibold">
                  Serviço e equipamento
                </h2>
              </div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <Data label="Tipo de serviço" value={order.serviceType} />
                <Data
                  label="Equipamento"
                  value={
                    order.equipment
                      ? `${order.equipment.name} · ${order.equipment.identifier}`
                      : 'Atendimento sem equipamento específico'
                  }
                />
              </dl>
            </Card>
          </div>

          {order.status === 'SCHEDULED' ||
          order.status === 'IN_PROGRESS' ||
          order.status === 'PENDING_CORRECTION' ? (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    {order.status === 'PENDING_CORRECTION' ? (
                      <ClipboardCheck aria-hidden="true" className="size-5" />
                    ) : (
                      <Play aria-hidden="true" className="size-5" />
                    )}
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-semibold">
                      {order.status === 'SCHEDULED'
                        ? 'Pronto para começar?'
                        : order.status === 'PENDING_CORRECTION'
                          ? 'Há uma correção para resolver'
                          : 'Atendimento em andamento'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Acesse a execução para registrar o trabalho em campo.
                    </p>
                  </div>
                </div>
                {order.status === 'SCHEDULED' ? (
                  <Button
                    className="w-full sm:w-auto"
                    size="lg"
                    disabled={starting}
                    onClick={() => setConfirmingStart(true)}
                  >
                    {starting ? 'Iniciando…' : 'Iniciar atendimento'}
                  </Button>
                ) : (
                  <Link
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'w-full sm:w-auto',
                    )}
                    href={`/field/ordens/${order.id}/executar`}
                  >
                    {order.status === 'PENDING_CORRECTION'
                      ? 'Corrigir atendimento'
                      : 'Continuar atendimento'}
                  </Link>
                )}
              </div>
            </Card>
          ) : null}
          <ConfirmDialog
            open={confirmingStart && order.status === 'SCHEDULED'}
            title="Iniciar este atendimento?"
            description={`O horário real de início da ${order.number} será registrado agora e a ordem passará para Em execução.`}
            confirmLabel="Sim, iniciar atendimento"
            pendingLabel="Iniciando…"
            pending={starting}
            onCancel={() => setConfirmingStart(false)}
            onConfirm={start}
          />
        </>
      ) : null}
    </section>
  )
}

export function safeFieldReturn(value: string | null) {
  return value?.startsWith('/field/ordens') && !value.startsWith('//')
    ? value
    : '/field/ordens'
}
function Data({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 break-words font-medium">{value}</dd>
    </div>
  )
}
function address(location: FieldWorkOrder['location']) {
  return `${location.street}, ${location.number}${location.complement ? `, ${location.complement}` : ''} · ${location.neighborhood}, ${location.city}/${location.state}`
}

function formatSchedule(order: FieldWorkOrder, timezone?: string) {
  const format = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat('pt-BR', {
          timeZone: timezone,
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(new Date(value))
      : 'Não informado'

  return `${format(order.scheduledStartAt)} — ${format(order.scheduledEndAt)}`
}
