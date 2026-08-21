'use client'

import { AlertTriangle, CreditCard } from 'lucide-react'
import Link from 'next/link'
import type { UserRole } from '@/features/auth/contracts'
import type { CurrentSubscription } from './contracts'

export function SubscriptionNotice({
  role,
  subscription,
}: {
  role: UserRole
  subscription?: CurrentSubscription
}) {
  if (
    !subscription ||
    !subscription.enforcementEnabled ||
    (subscription.access === 'FULL' &&
      subscription.status !== 'PAST_DUE' &&
      !subscription.cancelAtPeriodEnd)
  ) {
    return null
  }

  const pending = !subscription.planCode
  const overdueInGrace =
    subscription.status === 'PAST_DUE' && subscription.access === 'FULL'
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
          {pending ? (
            <CreditCard className="size-5" aria-hidden="true" />
          ) : (
            <AlertTriangle className="size-5" aria-hidden="true" />
          )}
        </span>
        <div>
          <p className="font-semibold">
            {pending
              ? 'Escolha um plano para liberar a operação'
              : overdueInGrace
                ? 'Pagamento em atraso — carência de 3 dias'
                : 'Acesso suspenso por pagamento'}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-amber-900/80">
            {role === 'OWNER'
              ? overdueInGrace
                ? 'Regularize a mensalidade dentro da carência para evitar o bloqueio da operação.'
                : 'Regularize a mensalidade para liberar novamente a operação.'
              : 'Peça ao proprietário da organização para verificar a assinatura.'}
          </p>
        </div>
      </div>
      {role === 'OWNER' ? (
        <Link
          className="shrink-0 rounded-xl bg-amber-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-amber-800"
          href="/app/assinatura"
        >
          Ver plano e cobrança
        </Link>
      ) : null}
    </div>
  )
}
