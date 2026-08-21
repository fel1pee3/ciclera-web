'use client'

import {
  AlertTriangle,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

import { FieldShell } from '@/components/layout/field-shell'
import { OfficeShell } from '@/components/layout/office-shell'
import { SubscriptionPortalShell } from '@/components/layout/subscription-portal-shell'
import { Button } from '@/components/ui/button'
import type { AuthenticatedAccount } from '@/features/auth/contracts'
import { subscriptionAreaAccess, type SubscriptionArea } from './access-policy'
import type { CurrentSubscription } from './contracts'
import { useSubscription } from './subscription-provider'

const subscriptionPath = '/app/assinatura'

export function OfficeSubscriptionArea({
  account,
  children,
}: {
  account: AuthenticatedAccount
  children: ReactNode
}) {
  return (
    <SubscriptionAreaBoundary account={account} area="office">
      {children}
    </SubscriptionAreaBoundary>
  )
}

export function FieldSubscriptionArea({
  account,
  children,
}: {
  account: AuthenticatedAccount
  children: ReactNode
}) {
  return (
    <SubscriptionAreaBoundary account={account} area="field">
      {children}
    </SubscriptionAreaBoundary>
  )
}

function SubscriptionAreaBoundary({
  account,
  area,
  children,
}: {
  account: AuthenticatedAccount
  area: SubscriptionArea
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { refresh, status, subscription } = useSubscription()
  const access = subscription
    ? subscriptionAreaAccess(subscription, account.user.role, area)
    : null
  const redirectOwner =
    access === 'OWNER_PORTAL' && pathname !== subscriptionPath

  useEffect(() => {
    if (redirectOwner) router.replace(subscriptionPath)
  }, [redirectOwner, router])

  if (status === 'loading' || redirectOwner) {
    return (
      <SubscriptionPortalShell account={account}>
        <LoadingState
          label={
            redirectOwner
              ? 'Abrindo a ativação da sua organização…'
              : 'Verificando a assinatura…'
          }
        />
      </SubscriptionPortalShell>
    )
  }

  if (status === 'unavailable' || !subscription) {
    return (
      <SubscriptionPortalShell account={account}>
        <UnavailableState retry={refresh} />
      </SubscriptionPortalShell>
    )
  }

  if (access === 'OPERATIONAL') {
    return area === 'office' ? (
      <OfficeShell account={account} subscription={subscription}>
        {children}
      </OfficeShell>
    ) : (
      <FieldShell account={account} subscription={subscription}>
        {children}
      </FieldShell>
    )
  }

  if (access === 'OWNER_PORTAL') {
    return (
      <SubscriptionPortalShell account={account}>
        {children}
      </SubscriptionPortalShell>
    )
  }

  return (
    <SubscriptionPortalShell account={account}>
      <BlockedState subscription={subscription} />
    </SubscriptionPortalShell>
  )
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-7 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function UnavailableState({
  retry,
}: {
  retry: () => Promise<CurrentSubscription>
}) {
  return (
    <section className="mx-auto mt-12 w-full max-w-lg rounded-3xl border bg-card p-7 text-center shadow-sm sm:p-9">
      <AlertTriangle className="mx-auto size-9 text-warning" />
      <h1 className="mt-5 font-heading text-2xl font-semibold">
        Não foi possível verificar a assinatura
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        A operação permanece protegida enquanto confirmamos a situação da conta.
        Tente novamente em instantes.
      </p>
      <Button className="mt-6" onClick={() => void retry()}>
        Tentar novamente
      </Button>
    </section>
  )
}

function BlockedState({ subscription }: { subscription: CurrentSubscription }) {
  const awaitingActivation = !subscription.planCode

  return (
    <section className="mx-auto mt-12 w-full max-w-xl overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="border-b bg-primary/5 p-7 text-center sm:p-9">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          {awaitingActivation ? (
            <CreditCard aria-hidden="true" />
          ) : (
            <LockKeyhole aria-hidden="true" />
          )}
        </span>
        <p className="eyebrow mt-5">Conta Ciclera</p>
        <h1 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">
          {awaitingActivation
            ? 'A organização ainda não foi ativada'
            : 'O acesso operacional está temporariamente restrito'}
        </h1>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
          {awaitingActivation
            ? 'O proprietário precisa escolher um plano e concluir o pagamento antes de iniciar a operação.'
            : 'Peça ao proprietário da organização para consultar a assinatura e regularizar a cobrança.'}
        </p>
      </div>
      <div className="p-5 text-center text-sm text-muted-foreground sm:p-6">
        Nenhum dado foi perdido. Clientes, ordens e evidências permanecem
        preservados com segurança.
      </div>
    </section>
  )
}
