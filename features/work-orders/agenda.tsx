'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, UserRound } from 'lucide-react'

import { Alert } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { listUsers } from '@/features/team/api'
import type { ManagedUser } from '@/features/team/contracts'
import {
  listAgenda,
  listWorkOrders,
  reassignWorkOrder,
  rescheduleWorkOrder,
  scheduleWorkOrder,
} from './api'
import type { Agenda, AgendaItem, WorkOrder } from './contracts'
import { workOrderStatuses } from './contracts'
import { getWorkOrderErrorMessage } from './errors'
import { WorkOrderStatusBadge, workOrderStatusLabel } from './status-badge'

interface AgendaQuery {
  from: string
  to: string
  technicianId?: string
  status?: AgendaItem['status']
}

export function AdministrativeAgenda() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = useMemo(() => readAgendaQuery(searchParams), [searchParams])
  const [agenda, setAgenda] = useState<Agenda | null>(null)
  const [technicians, setTechnicians] = useState<ManagedUser[]>([])
  const [drafts, setDrafts] = useState<WorkOrder[]>([])
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [scheduling, setScheduling] = useState(false)

  useEffect(() => {
    let active = true
    void Promise.all([
      listAgenda(query),
      listUsers({
        page: 1,
        pageSize: 100,
        role: 'TECHNICIAN',
        status: 'ACTIVE',
      }),
      listWorkOrders({ page: 1, pageSize: 100, status: 'DRAFT' }),
    ])
      .then(([nextAgenda, userPage, draftPage]) => {
        if (!active) return
        setAgenda(nextAgenda)
        setTechnicians(userPage.items)
        setDrafts(draftPage.items)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (active) setError(getWorkOrderErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [query, revision])

  const apply = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const params = new URLSearchParams()
    for (const key of ['from', 'to', 'technicianId', 'status']) {
      const value = data.get(key)
      if (typeof value === 'string' && value) params.set(key, value)
    }
    router.replace(`${pathname}?${params}`)
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Planejamento</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">Agenda</h1>
          <p className="mt-2 text-muted-foreground">
            Planejamento simples, sem rastreamento ou otimização de rotas.
          </p>
        </div>
        <Button onClick={() => setScheduling(true)}>Agendar ordem</Button>
      </header>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <Modal
        className="sm:max-w-4xl"
        open={scheduling}
        onClose={() => setScheduling(false)}
        title="Agendar rascunho"
        description="Escolha a ordem, o técnico responsável e o período planejado para o atendimento."
      >
        <ScheduleDraftForm
          drafts={drafts}
          technicians={technicians}
          timezone={agenda?.timezone ?? null}
          onCancel={() => setScheduling(false)}
          onSaved={() => {
            setScheduling(false)
            setRevision((value) => value + 1)
          }}
          onError={setError}
        />
      </Modal>
      <form
        className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault()
          apply(event.currentTarget)
        }}
      >
        <Field label="De">
          <Input type="date" name="from" defaultValue={query.from} />
        </Field>
        <Field label="Até">
          <Input type="date" name="to" defaultValue={query.to} />
        </Field>
        <Field label="Técnico">
          <TechnicianSelect
            name="technicianId"
            technicians={technicians}
            value={query.technicianId ?? ''}
            allLabel="Todos"
          />
        </Field>
        <Field label="Status">
          <select
            className="input"
            name="status"
            defaultValue={query.status ?? ''}
          >
            <option value="">Todos</option>
            {workOrderStatuses.map((status) => (
              <option key={status} value={status}>
                {workOrderStatusLabel(status)}
              </option>
            ))}
          </select>
        </Field>
        <Button className="self-end" type="submit">
          Aplicar filtros
        </Button>
      </form>
      {!agenda && !error ? (
        <Skeleton className="h-72 rounded-2xl" aria-label="Carregando agenda" />
      ) : null}
      {agenda ? (
        <p className="text-sm text-muted-foreground">
          Horários apresentados em {agenda.timezone}.
        </p>
      ) : null}
      {agenda?.items.length === 0 ? (
        <EmptyState
          title="Nenhuma ordem no período"
          description="Ajuste os filtros ou agende um rascunho."
        />
      ) : null}
      {agenda?.items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {agenda.items.map((order) => (
            <AgendaCard
              key={order.id}
              order={order}
              technicians={technicians}
              timezone={agenda.timezone}
              onSaved={() => setRevision((value) => value + 1)}
              onError={setError}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ScheduleDraftForm({
  drafts,
  technicians,
  timezone,
  onCancel,
  onSaved,
  onError,
}: {
  drafts: WorkOrder[]
  technicians: ManagedUser[]
  timezone: string | null
  onCancel: () => void
  onSaved: () => void
  onError: (message: string) => void
}) {
  const [workOrderId, setWorkOrderId] = useState('')
  const [technicianId, setTechnicianId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [pending, setPending] = useState(false)
  const submit = async () => {
    const draft = drafts.find((item) => item.id === workOrderId)
    if (!draft || !technicianId || !start || !end || !timezone) return
    setPending(true)
    try {
      await scheduleWorkOrder(draft.id, {
        version: draft.version,
        technicianId,
        scheduledStartAt: zonedLocalDateTimeToIso(start, timezone),
        scheduledEndAt: zonedLocalDateTimeToIso(end, timezone),
      })
      setWorkOrderId('')
      onSaved()
    } catch (reason) {
      onError(getWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ordem">
          <select
            className="input"
            value={workOrderId}
            onChange={(event) => setWorkOrderId(event.target.value)}
          >
            <option value="">Selecione</option>
            {drafts.map((draft) => (
              <option key={draft.id} value={draft.id}>
                {draft.number} · {draft.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Técnico">
          <TechnicianSelect
            technicians={technicians}
            value={technicianId}
            onChange={setTechnicianId}
          />
        </Field>
        <Field label="Início">
          <Input
            type="datetime-local"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </Field>
        <Field label="Término">
          <Input
            type="datetime-local"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </Field>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          disabled={
            pending ||
            !timezone ||
            !workOrderId ||
            !technicianId ||
            !start ||
            !end
          }
          onClick={() => void submit()}
        >
          {pending ? 'Agendando…' : 'Agendar'}
        </Button>
      </div>
    </div>
  )
}

function AgendaCard({
  order,
  technicians,
  timezone,
  onSaved,
  onError,
}: {
  order: AgendaItem
  technicians: ManagedUser[]
  timezone: string
  onSaved: () => void
  onError: (message: string) => void
}) {
  const [start, setStart] = useState(
    toZonedInput(order.scheduledStartAt, timezone),
  )
  const [end, setEnd] = useState(toZonedInput(order.scheduledEndAt, timezone))
  const [technicianId, setTechnicianId] = useState(
    order.activeAssignment.technicianId,
  )
  const [pending, setPending] = useState(false)
  const [editing, setEditing] = useState(false)
  const originalStart = toZonedInput(order.scheduledStartAt, timezone)
  const originalEnd = toZonedInput(order.scheduledEndAt, timezone)
  const scheduleChanged = start !== originalStart || end !== originalEnd
  const scheduleIsValid = Boolean(start && end && end > start)
  const technicianChanged = technicianId !== order.activeAssignment.technicianId

  const closeEditor = () => {
    setStart(originalStart)
    setEnd(originalEnd)
    setTechnicianId(order.activeAssignment.technicianId)
    setEditing(false)
  }

  const run = async (action: 'reschedule' | 'reassign') => {
    setPending(true)
    try {
      if (action === 'reschedule')
        await rescheduleWorkOrder(order.id, {
          version: order.version,
          scheduledStartAt: zonedLocalDateTimeToIso(start, timezone),
          scheduledEndAt: zonedLocalDateTimeToIso(end, timezone),
        })
      else
        await reassignWorkOrder(order.id, {
          version: order.version,
          technicianId,
        })
      setEditing(false)
      onSaved()
    } catch (reason) {
      onError(getWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }
  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-wide text-primary">
                {order.number}
              </p>
              <h2 className="mt-1 font-heading text-xl leading-snug font-bold">
                {order.title}
              </h2>
            </div>
            <WorkOrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid gap-4 border-y bg-muted/35 px-5 py-4 sm:grid-cols-2">
          <div className="flex min-w-0 items-start gap-3">
            <CalendarClock
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-primary"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Horário atual
              </p>
              <p className="mt-1 text-sm leading-relaxed font-medium">
                {formatInTimezone(order.scheduledStartAt, timezone)}
                <span className="mx-1 text-muted-foreground">—</span>
                {formatInTimezone(order.scheduledEndAt, timezone)}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-3">
            <UserRound
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-primary"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Técnico responsável
              </p>
              <p className="mt-1 truncate text-sm font-medium">
                {order.activeAssignment.technicianName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            className={buttonVariants({ variant: 'ghost' })}
            href={`/app/ordens/${order.id}?from=${encodeURIComponent('/app/agenda')}`}
          >
            Ver detalhes da ordem
          </Link>
          {order.status === 'SCHEDULED' ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Editar agendamento
            </Button>
          ) : null}
        </div>
      </Card>

      <Modal
        className="sm:max-w-3xl"
        open={editing && order.status === 'SCHEDULED'}
        onClose={closeEditor}
        title="Editar agendamento"
        description={`${order.number} · ${order.title}`}
      >
        <div className="space-y-6">
          <section aria-labelledby={`reschedule-${order.id}`}>
            <h3
              id={`reschedule-${order.id}`}
              className="font-heading text-base font-semibold"
            >
              Reagendar atendimento
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Altere o início ou o término para liberar o reagendamento.
            </p>
            <div className="mt-3 grid items-end gap-3 sm:grid-cols-2">
              <Field label="Novo início">
                <Input
                  type="datetime-local"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </Field>
              <Field label="Novo término">
                <Input
                  type="datetime-local"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                />
              </Field>
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                disabled={pending || !scheduleChanged || !scheduleIsValid}
                onClick={() => void run('reschedule')}
              >
                {pending ? 'Salvando…' : 'Reagendar'}
              </Button>
            </div>
          </section>

          <section
            className="border-t pt-5"
            aria-labelledby={`reassign-${order.id}`}
          >
            <h3
              id={`reassign-${order.id}`}
              className="font-heading text-base font-semibold"
            >
              Alterar responsável
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selecione outro técnico para reatribuir esta ordem.
            </p>
            <div className="mt-3 grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Field label="Técnico">
                <TechnicianSelect
                  technicians={technicians}
                  value={technicianId}
                  onChange={setTechnicianId}
                />
              </Field>
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                disabled={pending || !technicianId || !technicianChanged}
                onClick={() => void run('reassign')}
              >
                {pending ? 'Salvando…' : 'Reatribuir'}
              </Button>
            </div>
          </section>
          <div className="flex justify-end border-t pt-5">
            <Button variant="outline" onClick={closeEditor}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function TechnicianSelect({
  technicians,
  value,
  onChange,
  name,
  allLabel,
}: {
  technicians: ManagedUser[]
  value: string
  onChange?: (value: string) => void
  name?: string
  allLabel?: string
}) {
  return (
    <select
      aria-label="Técnico"
      className="input"
      name={name}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    >
      <option value="">{allLabel ?? 'Selecione'}</option>
      {technicians.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name}
        </option>
      ))}
    </select>
  )
}
function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <Label className="grid content-start gap-2">
      <span>{label}</span>
      {children}
    </Label>
  )
}

export function readAgendaQuery(params: URLSearchParams): AgendaQuery {
  const today = localDate(new Date())
  const from = validDate(params.get('from')) ?? today
  const to = validDate(params.get('to')) ?? addLocalDays(from, 6)
  const status = params.get('status')
  const technicianId = params.get('technicianId')
  return {
    from,
    to,
    ...(technicianId ? { technicianId } : {}),
    ...(workOrderStatuses.includes(status as never)
      ? { status: status as AgendaItem['status'] }
      : {}),
  }
}
function validDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}
function localDate(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000
  return new Date(value.getTime() - offset).toISOString().slice(0, 10)
}
function addLocalDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + days)
  return localDate(date)
}
function toZonedInput(value: string | null, timezone: string) {
  if (!value) return ''
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(value))
      .map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}
export function zonedLocalDateTimeToIso(value: string, timezone: string) {
  const [date, time] = value.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  let instant = Date.UTC(year, month - 1, day, hour, minute)
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(instant))
        .map((part) => [part.type, part.value]),
    )
    const rendered = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
    )
    instant += Date.UTC(year, month - 1, day, hour, minute) - rendered
  }
  return new Date(instant).toISOString()
}
export function formatInTimezone(value: string | null, timezone: string) {
  return value
    ? new Intl.DateTimeFormat('pt-BR', {
        timeZone: timezone,
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Não informado'
}
