'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/features/reviews/review-queue'
import { getDashboardSummary } from './api'
import type { DashboardStatus, DashboardSummary } from './contracts'

const stageLabels: Record<DashboardStatus, string> = {
  IN_PROGRESS: 'Em execução',
  AWAITING_REVIEW: 'Aguardando revisão',
  PENDING_CORRECTION: 'Com pendência',
  READY_TO_BILL: 'Prontas para faturar',
  BILLED: 'Faturadas no período',
}

const reasonLabels: Record<string, string> = {
  REQUIRED_PHOTO_MISSING: 'Foto obrigatória ausente',
  SIGNATURE_MISSING: 'Assinatura ausente',
  CHECKLIST_INCOMPLETE: 'Checklist incompleto',
  MATERIAL_WITHOUT_VALUE: 'Material sem valor',
  ADDITIONAL_SERVICE_UNAPPROVED: 'Serviço adicional não aprovado',
  EQUIPMENT_DATA_INCORRECT: 'Dados do equipamento incorretos',
  INCONSISTENT_SCHEDULE: 'Agenda inconsistente',
  OTHER: 'Outro motivo',
}

export function RevenueDashboard() {
  const [period, setPeriod] = useState(defaultPeriod)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void getDashboardSummary(period)
      .then((value) => {
        if (active) {
          setSummary(value)
          setError(null)
        }
      })
      .catch(() => active && setError('Não foi possível carregar o painel.'))
    return () => {
      active = false
    }
  }, [period])

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Garantia de receita</p>
          <h1 className="mt-3 font-heading text-3xl font-bold">
            Visão operacional
          </h1>
          <p className="mt-2 text-muted-foreground">
            Valores reais das ordens da sua organização.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DateFilter
            label="De"
            value={period.from}
            onChange={(from) => setPeriod((current) => ({ ...current, from }))}
          />
          <DateFilter
            label="Até"
            value={period.to}
            onChange={(to) => setPeriod((current) => ({ ...current, to }))}
          />
        </div>
      </header>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {!summary && !error ? (
        <Skeleton className="h-72 rounded-2xl" aria-label="Carregando painel" />
      ) : null}
      {summary ? (
        <>
          {isEmptyWorkspace(summary) ? <GettingStarted /> : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {(Object.keys(stageLabels) as DashboardStatus[]).map((status) => (
              <Link href={stageHref(status)} key={status}>
                <Card className="h-full p-5 transition hover:border-primary">
                  <p className="text-sm text-muted-foreground">
                    {stageLabels[status]}
                  </p>
                  <strong className="mt-2 block font-heading text-2xl">
                    {summary.stages[status].count}
                  </strong>
                  <span className="mt-1 block text-sm font-semibold text-primary">
                    {formatMoney(summary.stages[status].amountInCents)}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">
                Valor bloqueado por correção
              </p>
              <strong className="mt-2 block font-heading text-2xl text-primary">
                {formatMoney(summary.blockedAmountInCents)}
              </strong>
              <p className="mt-3 text-sm text-muted-foreground">
                Espera média na revisão:{' '}
                {summary.averageReviewWaitingSeconds === null
                  ? 'sem ordens aguardando'
                  : formatDuration(summary.averageReviewWaitingSeconds)}
              </p>
            </Card>
            <Card className="p-5 lg:col-span-2">
              <h2 className="font-heading text-lg font-semibold">
                Motivos recorrentes de bloqueio
              </h2>
              {summary.recurringBlockers.length ? (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {summary.recurringBlockers.map((item) => (
                    <li
                      className="flex justify-between gap-3 text-sm"
                      key={item.reason}
                    >
                      <span>{reasonLabels[item.reason] ?? item.reason}</span>
                      <strong>{item.count}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhuma correção no período.
                </p>
              )}
            </Card>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold">
              Ordens bloqueadas há mais tempo
            </h2>
            {summary.oldestBlocked.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {summary.oldestBlocked.map((order) => (
                  <Link href={`/app/ordens/${order.id}`} key={order.id}>
                    <Card className="p-4 transition hover:border-primary">
                      <div className="flex justify-between gap-3">
                        <strong>{order.number}</strong>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(order.agingSeconds)}
                        </span>
                      </div>
                      <p className="mt-1">{order.title}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                className="mt-4"
                title="Nenhuma ordem bloqueada"
                description="Não há ordens aguardando revisão ou correção neste período."
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Período {summary.period.from} a {summary.period.to} em{' '}
            {summary.timezone}.
          </p>
        </>
      ) : null}
    </section>
  )
}

function GettingStarted() {
  const steps = [
    {
      href: '/app/equipe',
      title: 'Monte sua equipe',
      description:
        'Adicione administradores e t\u00e9cnicos que usar\u00e3o a Ciclera.',
    },
    {
      href: '/app/clientes/novo',
      title: 'Cadastre o primeiro cliente e local',
      description:
        'Registre quem ser\u00e1 atendido e onde o servi\u00e7o acontece.',
    },
    {
      href: '/app/equipamentos/novo',
      title: 'Vincule os equipamentos',
      description: 'Organize os ativos de cada cliente e local.',
    },
    {
      href: '/app/ordens/nova',
      title: 'Crie a primeira ordem',
      description: 'Planeje o atendimento depois de concluir os cadastros.',
    },
  ]

  return (
    <Card className="border-primary/30 bg-primary/5 p-5 sm:p-6">
      <p className="eyebrow text-foreground">Primeiros passos</p>
      <h2 className="mt-2 font-heading text-xl font-semibold">
        Sua organização está pronta para ser configurada
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Siga esta ordem para preparar a operação sem criar dados fictícios.
      </p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="block h-full rounded-xl border border-border bg-card p-4 transition hover:border-primary"
            >
              <span className="text-xs font-bold text-primary">
                PASSO {index + 1}
              </span>
              <strong className="mt-2 block">{step.title}</strong>
              <span className="mt-1 block text-sm text-muted-foreground">
                {step.description}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  )
}

export function isEmptyWorkspace(summary: DashboardSummary): boolean {
  return Object.values(summary.stages).every((stage) => stage.count === 0)
}

function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Label className="grid gap-1 text-xs">
      <span>{label}</span>
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Label>
  )
}

function defaultPeriod() {
  const to = new Date().toISOString().slice(0, 10)
  return { from: `${to.slice(0, 8)}01`, to }
}

function stageHref(status: DashboardStatus) {
  if (status === 'AWAITING_REVIEW' || status === 'PENDING_CORRECTION')
    return '/app/revisao'
  if (status === 'READY_TO_BILL') return '/app/faturamento'
  return `/app/ordens?status=${status}`
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)} dia(s)`
}
