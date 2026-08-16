'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  findFieldWorkOrder,
  saveFieldWorkOrderExecution,
  startFieldWorkOrder,
  submitFieldWorkOrderForReview,
} from './api'
import { ApiError } from '@/lib/api/errors'
import type { FieldWorkOrder } from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'
import { ExecutionChecklistFields } from './execution-checklist'
import { ExecutionEvidence } from './execution-evidence'
import { ExecutionAdditionalItems } from './execution-additional-items'

export function FieldWorkOrderExecution() {
  const { workOrderId } = useParams<{ workOrderId: string }>()
  const [order, setOrder] = useState<FieldWorkOrder | null>(null)
  const [notes, setNotes] = useState('')
  const [confirmedNotes, setConfirmedNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [completionIssues, setCompletionIssues] = useState<string[]>([])
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
  const summary = useMemo(() => {
    if (!order) return null
    return `${order.number} · ${order.customer.name} · ${order.location.name}`
  }, [order])

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
    setCompletionIssues([])
    try {
      const updated = await submitFieldWorkOrderForReview(
        order.id,
        order.execution.version,
      )
      setOrder(updated)
      setNotice('Execução enviada para revisão do escritório.')
    } catch (reason: unknown) {
      if (reason instanceof ApiError) {
        const issues = reason.problem?.fieldErrors?.completion
        if (issues?.length) {
          setCompletionIssues(issues)
          return
        }
      }
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
    <section className="space-y-4 pb-24">
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <Link
          className="inline-flex min-h-11 items-center font-semibold text-primary"
          href={`/field/ordens/${workOrderId}`}
        >
          ← Voltar para a ordem
        </Link>
        {summary ? (
          <p className="truncate text-sm font-semibold">{summary}</p>
        ) : null}
        {dirty ? (
          <p className="mt-1 text-xs font-medium text-amber-700" role="status">
            Há alterações ainda não salvas.
          </p>
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
      {notice ? <Alert>{notice}</Alert> : null}

      {order ? (
        <Card className="space-y-5 p-5">
          <div>
            <p className="eyebrow">Execução em campo</p>
            <h1 className="mt-2 font-heading text-2xl font-bold">
              {order.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.description}
            </p>
          </div>

          {canStart ? (
            <Button
              className="w-full"
              size="lg"
              disabled={pending}
              onClick={() => void start()}
            >
              {pending ? 'Iniciando…' : 'Iniciar atendimento'}
            </Button>
          ) : null}

          {canEdit ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="execution-notes">
                  Observações do atendimento
                </Label>
                <Textarea
                  id="execution-notes"
                  value={notes}
                  maxLength={4000}
                  rows={10}
                  placeholder="Registre diagnóstico, atividades realizadas e informações importantes."
                  onChange={(event) => setNotes(event.target.value)}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {notes.length}/4000
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={pending || !dirty}
                  onClick={() => void save()}
                >
                  {pending ? 'Salvando…' : 'Salvar observações'}
                </Button>
              </div>
              {order.execution?.checklist ? (
                <ExecutionChecklistFields
                  key={order.execution.version}
                  order={order}
                  checklist={order.execution.checklist}
                  onSaved={setOrder}
                />
              ) : (
                <Alert>
                  Nenhum checklist foi configurado para este atendimento.
                </Alert>
              )}
              <ExecutionEvidence order={order} onOrderChange={setOrder} />
              <ExecutionAdditionalItems
                order={order}
                onOrderChange={setOrder}
              />
              {completionIssues.length ? (
                <Alert variant="destructive">
                  <p className="font-semibold">Pendências da execução:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {completionIssues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </Alert>
              ) : null}
              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="font-semibold">Finalizar atendimento</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Depois do envio, os dados ficam bloqueados até uma eventual
                  solicitação de correção.
                </p>
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  disabled={pending || dirty}
                  onClick={() => void submitForReview()}
                >
                  {pending ? 'Enviando…' : 'Enviar para revisão'}
                </Button>
                {dirty ? (
                  <p className="mt-2 text-sm text-amber-700">
                    Salve as observações antes de enviar.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {!canStart && !canEdit ? (
            <Alert>
              Esta ordem não está em um estado editável para execução.
            </Alert>
          ) : null}
        </Card>
      ) : null}
    </section>
  )
}
