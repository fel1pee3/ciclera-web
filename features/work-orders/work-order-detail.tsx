'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cancelWorkOrder, findWorkOrder } from './api'
import type { WorkOrderDetails } from './contracts'
import { getWorkOrderErrorMessage } from './errors'
import { WorkOrderForm } from './work-order-form'
import { WorkOrderStatusBadge, workOrderStatusLabel } from './status-badge'

export function WorkOrderDetail() {
  const { workOrderId } = useParams<{ workOrderId: string }>()
  const searchParams = useSearchParams()
  const backHref = useMemo(
    () => safeWorkOrderReturn(searchParams.get('from')),
    [searchParams],
  )
  const [workOrder, setWorkOrder] = useState<WorkOrderDetails | null>(null)
  const [editing, setEditing] = useState(false)
  const [reason, setReason] = useState('')
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void findWorkOrder(workOrderId)
      .then((value) => {
        if (active) setWorkOrder(value)
      })
      .catch((value: unknown) => {
        if (active) setError(getWorkOrderErrorMessage(value))
      })
    return () => {
      active = false
    }
  }, [workOrderId])

  const cancel = async () => {
    if (
      !workOrder ||
      reason.trim().length < 3 ||
      !window.confirm(
        `Cancelar ${workOrder.number}? Esta ação não apaga o histórico.`,
      )
    )
      return
    setCanceling(true)
    try {
      setWorkOrder(
        await cancelWorkOrder(workOrder.id, workOrder.version, reason),
      )
      setNotice('Ordem cancelada com histórico preservado.')
      setReason('')
    } catch (value) {
      setError(getWorkOrderErrorMessage(value))
    } finally {
      setCanceling(false)
    }
  }

  if (!workOrder && !error)
    return (
      <Skeleton
        className="mx-auto h-96 max-w-6xl rounded-2xl"
        aria-label="Carregando ordem"
      />
    )
  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Link className="text-sm font-semibold text-primary" href={backHref}>
        ← Voltar para ordens
      </Link>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {workOrder ? (
        <>
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{workOrder.number}</p>
                <h1 className="mt-3 font-heading text-3xl font-bold">
                  {workOrder.title}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {workOrder.serviceType}
                </p>
              </div>
              <WorkOrderStatusBadge status={workOrder.status} />
            </div>
            <p className="mt-5 whitespace-pre-wrap">{workOrder.description}</p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Data
                label="Início previsto"
                value={formatDate(workOrder.scheduledStartAt)}
              />
              <Data
                label="Término previsto"
                value={formatDate(workOrder.scheduledEndAt)}
              />
              <Data
                label="Valor previsto"
                value={formatMoney(workOrder.expectedAmountInCents)}
              />
              <Data label="Versão" value={String(workOrder.version)} />
            </dl>
            {workOrder.status === 'DRAFT' ? (
              <Button
                className="mt-5"
                variant="outline"
                onClick={() => setEditing(true)}
              >
                Editar rascunho
              </Button>
            ) : null}
          </Card>
          {editing && workOrder.status === 'DRAFT' ? (
            <WorkOrderForm
              workOrder={workOrder}
              onCancel={() => setEditing(false)}
              onSaved={(value) => {
                setWorkOrder(value)
                setEditing(false)
                setNotice('Ordem atualizada.')
              }}
            />
          ) : null}
          {workOrder.status === 'DRAFT' ? (
            <Card className="p-5">
              <h2 className="font-heading text-lg font-semibold">
                Cancelar ordem
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Informe um motivo. O registro e o histórico serão preservados.
              </p>
              <Label className="mt-4 grid max-w-xl gap-2">
                <span>Motivo</span>
                <Input
                  value={reason}
                  maxLength={1000}
                  onChange={(event) => setReason(event.target.value)}
                />
              </Label>
              <Button
                className="mt-3"
                variant="ghost"
                disabled={canceling || reason.trim().length < 3}
                onClick={() => void cancel()}
              >
                {canceling ? 'Cancelando…' : 'Cancelar ordem'}
              </Button>
            </Card>
          ) : null}
          <div>
            <h2 className="font-heading text-2xl font-bold">Histórico</h2>
            <ol className="mt-4 space-y-3">
              {workOrder.history.map((entry) => (
                <li key={entry.id} className="rounded-2xl border bg-card p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <strong>{workOrderStatusLabel(entry.newStatus)}</strong>
                    <time
                      className="text-sm text-muted-foreground"
                      dateTime={entry.createdAt}
                    >
                      {formatDate(entry.createdAt)}
                    </time>
                  </div>
                  {entry.reason ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {historyReason(entry.reason)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : null}
    </section>
  )
}

export function NewWorkOrder() {
  const router = useRouter()
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Link className="text-sm font-semibold text-primary" href="/app/ordens">
        ← Voltar para ordens
      </Link>
      <div>
        <p className="eyebrow">Operação</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">
          Nova ordem de serviço
        </h1>
      </div>
      <WorkOrderForm
        onSaved={(order) => router.push(`/app/ordens/${order.id}`)}
      />
    </section>
  )
}

export function safeWorkOrderReturn(value: string | null): string {
  return value?.startsWith('/app/ordens') && !value.startsWith('//')
    ? value
    : '/app/ordens'
}
function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Não informado'
}
function formatMoney(value: string | null) {
  return value === null
    ? 'Não informado'
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(BigInt(value)) / 100)
}
function historyReason(value: string) {
  return value === 'WORK_ORDER_CREATED' ? 'Ordem criada.' : value
}
