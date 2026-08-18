'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ClipboardCheck,
  FileText,
  MapPin,
  Play,
  Save,
  Send,
} from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from '@/features/auth/session-provider'
import { WorkOrderStatusBadge } from '@/features/work-orders/status-badge'
import {
  findFieldWorkOrder,
  saveFieldWorkOrderExecution,
  startFieldWorkOrder,
  submitFieldWorkOrderForReview,
  resumeFieldWorkOrderCorrection,
} from './api'
import type { FieldWorkOrder } from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'
import { ExecutionEvidence } from './execution-evidence'
import { ExecutionAdditionalItems } from './execution-additional-items'

export function FieldWorkOrderExecution() {
  const { account } = useSession()
  const { workOrderId } = useParams<{ workOrderId: string }>()
  const [order, setOrder] = useState<FieldWorkOrder | null>(null)
  const [notes, setNotes] = useState('')
  const [confirmedNotes, setConfirmedNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    void findFieldWorkOrder(workOrderId)
      .then((value) => {
        if (!active) return
        const persistedNotes = value.execution?.notes ?? ''
        setOrder(value)
        setNotes(persistedNotes)
        setConfirmedNotes(persistedNotes)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (active) setError(getFieldWorkOrderErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [workOrderId, reloadKey])

  const dirty = notes !== confirmedNotes
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const canStart = order?.status === 'SCHEDULED' && !order.execution
  const canEdit = order?.status === 'IN_PROGRESS' && order.execution
  const canResume = order?.status === 'PENDING_CORRECTION' && order.execution

  async function start() {
    if (!order) return
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      const updated = await startFieldWorkOrder(order.id, order.version)
      setOrder(updated)
      setNotes(updated.execution?.notes ?? '')
      setConfirmedNotes(updated.execution?.notes ?? '')
      setNotice('Atendimento iniciado e registrado no servidor.')
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }

  async function save() {
    if (!order?.execution) return
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      const updated = await saveFieldWorkOrderExecution(order.id, {
        version: order.execution.version,
        notes: notes.trim() || null,
      })
      const persistedNotes = updated.execution?.notes ?? ''
      setOrder(updated)
      setNotes(persistedNotes)
      setConfirmedNotes(persistedNotes)
      setNotice('Observações salvas no servidor.')
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }

  async function submitForReview() {
    if (!order?.execution || dirty) return
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      const updated = await submitFieldWorkOrderForReview(
        order.id,
        order.execution.version,
      )
      setOrder(updated)
      setNotice('Execução enviada para revisão do escritório.')
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }

  async function resumeCorrection() {
    if (!order) return
    setPending(true)
    setError(null)
    try {
      const updated = await resumeFieldWorkOrderCorrection(
        order.id,
        order.version,
      )
      setOrder(updated)
      setNotice('Correção iniciada. Os campos estão liberados novamente.')
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }

  if (!order && !error) {
    return (
      <Skeleton
        className="h-[32rem] rounded-2xl"
        aria-label="Carregando execução"
      />
    )
  }

  return (
    <section className="space-y-5 pb-24">
      <div className="sticky top-[4.5rem] z-20 -mx-4 flex min-h-14 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Link
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary"
          href={`/field/ordens/${workOrderId}`}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar para a ordem
        </Link>
        {dirty ? (
          <span
            className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
            role="status"
          >
            Não salvo
          </span>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive">
          <p>{error}</p>
          <Button
            className="mt-3"
            type="button"
            variant="outline"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Recarregar dados do servidor
          </Button>
        </Alert>
      ) : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}

      {order ? (
        <>
          <Card className="overflow-hidden p-0">
            <div className="p-5 sm:p-7">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <p className="eyebrow">Execução em campo · {order.number}</p>
                  <h1 className="mt-2 break-words font-heading text-2xl leading-tight font-bold sm:text-3xl">
                    {order.title}
                  </h1>
                </div>
                <WorkOrderStatusBadge status={order.status} />
              </div>
              <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-base">
                {order.description}
              </p>
            </div>

            <div className="grid gap-4 border-t bg-muted/30 px-5 py-4 text-sm sm:grid-cols-3 sm:px-7">
              <ExecutionContext
                icon={<Building2 aria-hidden="true" className="size-4" />}
                label="Cliente"
                value={order.customer.name}
              />
              <ExecutionContext
                icon={<MapPin aria-hidden="true" className="size-4" />}
                label="Local"
                value={order.location.name}
              />
              <ExecutionContext
                icon={<CalendarClock aria-hidden="true" className="size-4" />}
                label="Horário"
                value={formatSchedule(
                  order.scheduledStartAt,
                  order.scheduledEndAt,
                  account?.organization.timezone,
                )}
              />
            </div>
          </Card>

          {canStart ? (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <Play aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-semibold">
                      Pronto para iniciar?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      O horário real de início será registrado no servidor.
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full sm:w-auto"
                  size="lg"
                  disabled={pending}
                  onClick={() => void start()}
                >
                  <Play aria-hidden="true" />
                  {pending ? 'Iniciando…' : 'Iniciar atendimento'}
                </Button>
              </div>
            </Card>
          ) : null}

          {canResume && order.currentCorrection ? (
            <Alert variant="destructive">
              <p className="font-semibold">Correção solicitada</p>
              <p className="mt-2">{order.currentCorrection.description}</p>
              <Button
                className="mt-4 w-full"
                disabled={pending}
                onClick={() => void resumeCorrection()}
              >
                {pending ? 'Liberando…' : 'Iniciar correção'}
              </Button>
            </Alert>
          ) : null}

          {canEdit ? (
            <div className="space-y-4">
              <Card className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-semibold">
                      Observações do atendimento
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Registre o diagnóstico e o trabalho realizado.
                    </p>
                  </div>
                </div>
                <Label className="sr-only" htmlFor="execution-notes">
                  Observações do atendimento
                </Label>
                <Textarea
                  className="mt-4"
                  id="execution-notes"
                  value={notes}
                  maxLength={4000}
                  rows={10}
                  placeholder="Registre diagnóstico, atividades realizadas e informações importantes."
                  onChange={(event) => setNotes(event.target.value)}
                />
                <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {notes.length}/4000 caracteres
                  </p>
                  <Button
                    className="w-full sm:w-auto"
                    disabled={pending || !dirty}
                    onClick={() => void save()}
                  >
                    <Save aria-hidden="true" />
                    {pending ? 'Salvando…' : 'Salvar observações'}
                  </Button>
                </div>
              </Card>
              <ExecutionEvidence order={order} onOrderChange={setOrder} />
              <ExecutionAdditionalItems
                order={order}
                onOrderChange={setOrder}
              />
              <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                      <ClipboardCheck aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-heading text-lg font-semibold">
                        Finalizar atendimento
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Depois do envio, os dados ficam bloqueados até uma
                        eventual solicitação de correção.
                      </p>
                      {dirty ? (
                        <p className="mt-2 text-sm font-medium text-amber-700">
                          Salve as observações antes de enviar.
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    size="lg"
                    disabled={pending || dirty}
                    onClick={() => void submitForReview()}
                  >
                    <Send aria-hidden="true" />
                    {pending ? 'Enviando…' : 'Enviar para revisão'}
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}

          {!canStart && !canEdit && !canResume ? (
            <Alert>
              Esta ordem não está em um estado editável para execução.
            </Alert>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

function ExecutionContext({
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
      <span className="mt-0.5 shrink-0 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-1 break-words font-medium">{value}</p>
      </div>
    </div>
  )
}

function formatSchedule(
  start: string | null,
  end: string | null,
  timezone?: string,
) {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: timezone,
    dateStyle: 'short',
    timeStyle: 'short',
  })
  const format = (value: string | null) =>
    value ? formatter.format(new Date(value)) : 'Não informado'
  return `${format(start)} — ${format(end)}`
}
