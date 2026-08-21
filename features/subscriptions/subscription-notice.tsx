'use client'

import { AlertTriangle, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { UserRole } from '@/features/auth/contracts'
import { getCurrentSubscription } from './api'
import type { CurrentSubscription } from './contracts'

export function SubscriptionNotice({ role }: { role: UserRole }) {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null,
  )

  useEffect(() => {
    let active = true
    void getCurrentSubscription()
      .then((value) => active && setSubscription(value))
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  if (
    !subscription ||
    !subscription.enforcementEnabled ||
    (subscription.access === 'FULL' && !subscription.cancelAtPeriodEnd)
  ) {
    return null
  }

  const pending = !subscription.planCode
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
              : 'A assinatura precisa de atenção'}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-amber-900/80">
            {role === 'OWNER'
              ? 'Consulte a situação e regularize a cobrança com segurança.'
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
