'use client'

import {
  Check,
  CreditCard,
  Database,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import type { AuthenticatedAccount } from '@/features/auth/contracts'
import {
  cancelSubscription,
  changeSubscriptionPlan,
  createSubscriptionCheckout,
  listSubscriptionPlans,
} from './api'
import type { CurrentSubscription, SubscriptionPlan } from './contracts'
import { useSubscription } from './subscription-provider'

export function SubscriptionManagement({
  account,
}: {
  account: AuthenticatedAccount
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const { refresh, subscription, update } = useSubscription()
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null)
  const [changingTo, setChangingTo] = useState<SubscriptionPlan | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [confirmingPayment, setConfirmingPayment] = useState(
    () => searchParams.get('retorno') === 'sucesso',
  )
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(() =>
    checkoutReturnMessage(searchParams.get('retorno')),
  )

  const isOwner = account.user.role === 'OWNER'
  const reload = async () => {
    setError(null)
    try {
      const [planResult] = await Promise.all([
        listSubscriptionPlans(),
        refresh(),
      ])
      setPlans(planResult.items)
    } catch {
      setError('Não foi possível carregar a assinatura. Tente novamente.')
    }
  }

  useEffect(() => {
    let active = true
    void listSubscriptionPlans()
      .then((planResult) => {
        if (!active) return
        setPlans(planResult.items)
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível carregar a assinatura. Tente novamente.')
        }
      })
    return () => {
      active = false
    }
  }, [])

  const checkoutReturn = searchParams.get('retorno')

  useEffect(() => {
    if (checkoutReturn !== 'sucesso') return

    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0

    const confirmPayment = async () => {
      attempts += 1
      try {
        const current = await refresh()
        if (!active) return
        if (!current.enforcementEnabled || current.access === 'FULL') {
          setConfirmingPayment(false)
          setNotice('Pagamento confirmado. Sua operação foi liberada.')
          router.replace('/app')
          router.refresh()
          return
        }
      } catch {
        // A próxima tentativa cobre indisponibilidades transitórias do webhook.
      }

      if (!active) return
      if (attempts >= 20) {
        setConfirmingPayment(false)
        setNotice(
          'O Asaas ainda está confirmando o pagamento. Use “Atualizar situação” em alguns instantes; nenhuma nova cobrança será criada.',
        )
        return
      }
      timer = setTimeout(() => void confirmPayment(), 3_000)
    }

    void confirmPayment()
    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [checkoutReturn, refresh, router])

  const status = useMemo(
    () => (subscription ? statusPresentation(subscription) : null),
    [subscription],
  )

  async function openCheckout(method: 'CREDIT_CARD' | 'PIX' | 'BOLETO') {
    if (!selected) return
    setPending(true)
    setError(null)
    try {
      const checkout = await createSubscriptionCheckout(selected.code, method)
      window.location.assign(checkout.checkoutUrl)
    } catch {
      setError(
        'Não foi possível abrir o pagamento seguro. Tente novamente em instantes.',
      )
      setSelected(null)
    } finally {
      setPending(false)
    }
  }

  async function confirmPlanChange() {
    if (!changingTo) return
    setPending(true)
    setError(null)
    try {
      update(await changeSubscriptionPlan(changingTo.code))
      setNotice(
        `A mudança para o plano ${changingTo.name} foi programada para o próximo ciclo.`,
      )
      setChangingTo(null)
    } catch {
      setError(
        'A troca não pôde ser programada. Confira se o uso atual cabe no novo plano.',
      )
    } finally {
      setPending(false)
    }
  }

  async function confirmCancellation() {
    setPending(true)
    setError(null)
    try {
      update(await cancelSubscription())
      setNotice(
        'A renovação foi cancelada. O acesso segue disponível até o fim do período já pago.',
      )
      setCancelOpen(false)
    } catch {
      setError('Não foi possível cancelar a renovação. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Conta Ciclera</p>
          <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
            Plano e assinatura
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Escolha a capacidade da sua operação. Clientes, equipamentos e
            ordens não possuem limite por plano.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void reload()}>
          <RefreshCw
            aria-hidden="true"
            className={confirmingPayment ? 'animate-spin' : undefined}
          />{' '}
          {confirmingPayment ? 'Confirmando pagamento…' : 'Atualizar situação'}
        </Button>
      </header>

      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}
      {!subscription ? (
        <Skeleton
          className="h-48 rounded-3xl"
          aria-label="Carregando assinatura"
        />
      ) : null}

      {subscription && status ? (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-4 border-b bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-xl font-semibold">
                    {subscription.plan?.name ?? 'Assinatura ainda não iniciada'}
                  </h2>
                  <Badge>{status.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {status.description}
                </p>
              </div>
            </div>
            {subscription.currentPeriodEnd ? (
              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Acesso até
                </p>
                <p className="mt-1 font-semibold">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            ) : null}
          </div>
          {subscription.plan ? (
            <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
              <Usage
                label="Técnicos ativos"
                value={subscription.usage.technicians}
                maximum={subscription.plan.maxTechnicians}
                icon={<Users />}
              />
              <Usage
                label="Acessos administrativos"
                value={subscription.usage.administrativeUsers}
                maximum={subscription.plan.maxAdministrativeUsers}
                icon={<ShieldCheck />}
              />
              <Usage
                label="Evidências armazenadas"
                value={formatBytes(subscription.usage.evidenceStorageBytes)}
                maximum={formatBytes(subscription.plan.evidenceStorageBytes)}
                icon={<Database />}
              />
            </div>
          ) : null}
          {isOwner && subscription.latestInvoiceUrl ? (
            <div className="border-t p-5 sm:p-6">
              <a
                className={buttonVariants()}
                href={subscription.latestInvoiceUrl}
                rel="noreferrer"
              >
                Regularizar pagamento no Asaas
              </a>
            </div>
          ) : null}
        </Card>
      ) : null}

      {subscription && !subscription.enforcementEnabled ? (
        <Alert>
          A cobrança está desativada neste ambiente. Configure o Asaas no
          backend para testar a contratação e aplicar os limites dos planos.
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => {
          const current = subscription?.planCode === plan.code
          return (
            <Card
              className={`relative flex h-full flex-col p-6 ${plan.recommended ? 'border-primary shadow-md shadow-primary/10' : ''}`}
              key={plan.code}
            >
              {plan.recommended ? (
                <span className="absolute right-5 top-5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Mais escolhido
                </span>
              ) : null}
              <p className="text-sm font-semibold text-primary">{plan.name}</p>
              <p className="mt-4 font-heading text-4xl font-bold">
                {formatMoney(plan.priceInCents)}
                <span className="text-base font-normal text-muted-foreground">
                  /mês
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                <Feature>{plan.maxTechnicians} técnicos ativos</Feature>
                <Feature>
                  {plan.maxAdministrativeUsers} acessos administrativos,
                  incluindo proprietários
                </Feature>
                <Feature>
                  {formatBytes(plan.evidenceStorageBytes)} para fotos e
                  assinaturas
                </Feature>
                <Feature>Clientes, equipamentos e ordens ilimitados</Feature>
                <Feature>Todos os recursos operacionais do MVP</Feature>
              </ul>
              <Button
                className="mt-7 w-full"
                variant={current ? 'outline' : 'default'}
                disabled={
                  !isOwner ||
                  current ||
                  subscription?.cancelAtPeriodEnd ||
                  subscription?.enforcementEnabled === false
                }
                onClick={() =>
                  subscription?.planCode
                    ? setChangingTo(plan)
                    : setSelected(plan)
                }
              >
                {current
                  ? 'Plano atual'
                  : subscription?.planCode
                    ? 'Mudar para este plano'
                    : 'Escolher plano'}
              </Button>
            </Card>
          )
        })}
      </div>

      {!isOwner ? (
        <Alert>
          Somente o proprietário pode contratar, trocar ou cancelar o plano.
        </Alert>
      ) : null}
      {isOwner && subscription?.planCode && !subscription.cancelAtPeriodEnd ? (
        <Card className="flex flex-col gap-4 border-destructive/25 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Cancelar renovação
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nenhum dado é apagado. O acesso continua até o fim do período
              pago.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setCancelOpen(true)}>
            Cancelar assinatura
          </Button>
        </Card>
      ) : null}

      <Modal
        open={Boolean(selected)}
        onClose={() => !pending && setSelected(null)}
        title={
          selected ? `Assinar o plano ${selected.name}` : 'Escolher pagamento'
        }
        description="Você será encaminhado ao ambiente seguro do Asaas. A Ciclera não recebe nem armazena os dados do seu cartão."
      >
        <div className="grid gap-3">
          <PaymentButton
            icon={<CreditCard />}
            title="Cartão de crédito"
            detail="Cobrança mensal automática."
            disabled={pending}
            onClick={() => void openCheckout('CREDIT_CARD')}
          />
          <PaymentButton
            icon={<Smartphone />}
            title="Pix"
            detail="Pagamento mensal confirmado por Pix."
            disabled={pending}
            onClick={() => void openCheckout('PIX')}
          />
          <PaymentButton
            icon={<Database />}
            title="Boleto bancário"
            detail="Um boleto é disponibilizado a cada mensalidade."
            disabled={pending}
            onClick={() => void openCheckout('BOLETO')}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(changingTo)}
        title={
          changingTo ? `Mudar para o plano ${changingTo.name}?` : 'Mudar plano?'
        }
        description="A nova capacidade e o novo valor entram no próximo ciclo. Não há cobrança proporcional nem reembolso automático no ciclo atual."
        confirmLabel="Programar mudança"
        pending={pending}
        onCancel={() => setChangingTo(null)}
        onConfirm={() => void confirmPlanChange()}
      />
      <ConfirmDialog
        open={cancelOpen}
        title="Cancelar a renovação da assinatura?"
        description="A cobrança recorrente será encerrada. Sua organização continuará acessando o sistema até o fim do período já pago e os dados serão preservados."
        confirmLabel="Sim, cancelar renovação"
        variant="destructive"
        pending={pending}
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => void confirmCancellation()}
      />
    </section>
  )
}

function Feature({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <Check
        className="mt-0.5 size-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <span>{children}</span>
    </li>
  )
}

function Usage({
  label,
  value,
  maximum,
  icon,
}: {
  label: string
  value: string | number
  maximum: string | number
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl bg-muted/35 p-4">
      <span className="text-primary [&>svg]:size-5">{icon}</span>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-xl font-semibold">
        {value}{' '}
        <span className="text-sm font-normal text-muted-foreground">
          de {maximum}
        </span>
      </p>
    </div>
  )
}

function PaymentButton({
  icon,
  title,
  detail,
  disabled,
  onClick,
}: {
  icon: ReactNode
  title: string
  detail: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border p-4 text-left transition hover:border-primary hover:bg-primary/5 disabled:opacity-50"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary [&>svg]:size-5">
        {icon}
      </span>
      <span>
        <strong className="block">{title}</strong>
        <span className="text-sm text-muted-foreground">{detail}</span>
      </span>
    </button>
  )
}

function statusPresentation(subscription: CurrentSubscription) {
  if (subscription.cancelAtPeriodEnd)
    return {
      label: 'Cancelamento programado',
      description:
        'A renovação foi encerrada; seus dados permanecem preservados.',
    }
  if (subscription.status === 'ACTIVE')
    return {
      label: 'Ativa',
      description: 'Assinatura confirmada e operação liberada.',
    }
  if (subscription.status === 'PAST_DUE')
    return {
      label: 'Pagamento pendente',
      description:
        subscription.access === 'FULL'
          ? 'A carência termina 3 dias após o vencimento. Regularize para evitar o bloqueio.'
          : 'A carência terminou e a operação está bloqueada até a regularização.',
    }
  if (subscription.status === 'PENDING')
    return {
      label: 'Aguardando contratação',
      description: 'Não há período de teste. Escolha um plano para iniciar.',
    }
  return {
    label: 'Encerrada',
    description: 'Escolha um plano para voltar a utilizar a operação.',
  }
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
function formatBytes(bytes: number) {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(bytes / 1024 / 1024 / 1024)} GB`
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(
    new Date(value),
  )
}

function checkoutReturnMessage(value: string | null): string | null {
  if (value === 'sucesso') {
    return 'Pagamento enviado. A liberação acontece automaticamente após a confirmação do Asaas.'
  }
  if (value === 'cancelado') {
    return 'Pagamento cancelado. Nenhuma assinatura foi ativada e você pode tentar novamente quando quiser.'
  }
  if (value === 'expirado') {
    return 'O link de pagamento expirou. Escolha o plano e gere um novo link seguro.'
  }
  return null
}
