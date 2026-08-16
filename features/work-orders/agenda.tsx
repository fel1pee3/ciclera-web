'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      <div>
        <p className="eyebrow">Planejamento</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Agenda</h1>
        <p className="mt-2 text-muted-foreground">
          Planejamento simples, sem rastreamento ou otimização de rotas.
        </p>
      </div>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
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
      <ScheduleDraftForm
        drafts={drafts}
        technicians={technicians}
        timezone={agenda?.timezone ?? null}
        onSaved={() => setRevision((value) => value + 1)}
        onError={setError}
      />
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
  onSaved,
  onError,
}: {
  drafts: WorkOrder[]
  technicians: ManagedUser[]
  timezone: string | null
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
    <Card className="p-5">
      <h2 className="font-heading text-xl font-semibold">Agendar rascunho</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
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
        <Button
          className="self-end"
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
    </Card>
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
      onSaved()
    } catch (reason) {
      onError(getWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{order.number}</p>
          <h2 className="font-heading text-lg font-bold">{order.title}</h2>
        </div>
        <WorkOrderStatusBadge status={order.status} />
      </div>
      <p className="mt-3 text-sm">
        {formatInTimezone(order.scheduledStartAt, timezone)} —{' '}
        {formatInTimezone(order.scheduledEndAt, timezone)}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {order.activeAssignment.technicianName}
      </p>
      {order.status === 'SCHEDULED' ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => void run('reschedule')}
          >
            Reagendar
          </Button>
          <div className="grid gap-2">
            <TechnicianSelect
              technicians={technicians}
              value={technicianId}
              onChange={setTechnicianId}
            />
            <Button
              variant="outline"
              disabled={
                pending || technicianId === order.activeAssignment.technicianId
              }
              onClick={() => void run('reassign')}
            >
              Reatribuir
            </Button>
          </div>
        </div>
      ) : null}
      <Link
        className={`${buttonVariants({ variant: 'ghost' })} mt-4`}
        href={`/app/ordens/${order.id}?from=${encodeURIComponent('/app/agenda')}`}
      >
        Ver ordem
      </Link>
    </Card>
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
