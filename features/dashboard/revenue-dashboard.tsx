'use client'

import {
  ArrowRight,
  Building2,
  Check,
  ClipboardList,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMoney } from '@/features/reviews/review-queue'
import { cn } from '@/lib/utils'
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
          {isSetupComplete(summary.setup) ? null : (
            <GettingStarted setup={summary.setup} />
          )}
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

type SetupProgress = DashboardSummary['setup']

interface SetupStep {
  href: string
  title: string
  description: string
  icon: LucideIcon
  isComplete: (setup: SetupProgress) => boolean
}

const setupSteps: readonly SetupStep[] = [
  {
    href: '/app/equipe',
    title: 'Monte sua equipe',
    description: 'Adicione quem vai administrar ou executar os atendimentos.',
    icon: Users,
    isComplete: (setup) => setup.activeUserCount > 1,
  },
  {
    href: '/app/clientes/novo',
    title: 'Cadastre cliente e local',
    description: 'Registre quem será atendido e onde o serviço acontece.',
    icon: Building2,
    isComplete: (setup) => setup.customerCount > 0 && setup.locationCount > 0,
  },
  {
    href: '/app/equipamentos/novo',
    title: 'Vincule um equipamento',
    description: 'Organize o primeiro ativo no cliente e local corretos.',
    icon: Wrench,
    isComplete: (setup) => setup.equipmentCount > 0,
  },
  {
    href: '/app/ordens/nova',
    title: 'Crie a primeira ordem',
    description: 'Planeje o primeiro atendimento da sua operação.',
    icon: ClipboardList,
    isComplete: (setup) => setup.workOrderCount > 0,
  },
]

export function GettingStarted({ setup }: { setup: SetupProgress }) {
  const steps = setupSteps.map((step) => ({
    ...step,
    completed: step.isComplete(setup),
  }))
  const completedCount = steps.filter((step) => step.completed).length
  const currentStep = steps.findIndex((step) => !step.completed)
  const remainingCount = steps.length - completedCount
  const progress = (completedCount / steps.length) * 100

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-secondary/[0.08] p-0">
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-24 size-64 rounded-full border border-primary/10 bg-white/25"
      />
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow text-primary">Configuração inicial</p>
            <h2 className="mt-2 font-heading text-xl font-semibold sm:text-2xl">
              {completedCount === 0
                ? 'Prepare sua operação para o primeiro atendimento'
                : 'Sua operação está ganhando forma'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {completedCount === 0
                ? 'Siga as etapas abaixo. O progresso é atualizado automaticamente conforme você cadastra os dados.'
                : remainingCount === 1
                  ? 'Falta 1 etapa para concluir a configuração.'
                  : 'Faltam ' +
                    remainingCount +
                    ' etapas para concluir a configuração.'}
            </p>
          </div>
          <div className="rounded-full border border-primary/15 bg-card/80 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
            {completedCount} de {steps.length} concluídos
          </div>
        </div>

        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-primary/10"
          role="progressbar"
          aria-label="Progresso da configuração inicial"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={completedCount}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: String(progress) + '%' }}
          />
        </div>

        <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const current = index === currentStep
            return (
              <li key={step.href}>
                <Link
                  href={step.href}
                  className={cn(
                    'group flex h-full min-h-48 flex-col rounded-2xl border p-4 transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5',
                    step.completed &&
                      'border-primary/15 bg-primary/[0.06] hover:border-primary/30',
                    current &&
                      'border-primary bg-card shadow-[0_14px_35px_-24px_rgba(0,128,110,0.8)]',
                    !step.completed &&
                      !current &&
                      'border-border/80 bg-card/70 hover:border-primary/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'grid size-10 place-items-center rounded-xl',
                        step.completed
                          ? 'bg-primary text-primary-foreground'
                          : current
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {step.completed ? (
                        <Check aria-hidden="true" className="size-5" />
                      ) : (
                        <Icon aria-hidden="true" className="size-5" />
                      )}
                    </span>
                    <span
                      className={cn(
                        'text-[0.65rem] font-bold uppercase tracking-[0.12em]',
                        step.completed || current
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {step.completed
                        ? 'Concluído'
                        : current
                          ? 'Próximo passo'
                          : 'Etapa ' + (index + 1)}
                    </span>
                  </div>
                  <strong className="mt-4 block font-heading text-base">
                    {step.title}
                  </strong>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </span>
                  <span
                    className={cn(
                      'mt-auto flex items-center gap-1.5 pt-4 text-xs font-semibold',
                      step.completed || current
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    {step.completed
                      ? 'Revisar'
                      : current
                        ? 'Começar agora'
                        : 'Acessar etapa'}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </Card>
  )
}

export function isSetupComplete(setup: SetupProgress): boolean {
  return setupSteps.every((step) => step.isComplete(setup))
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
