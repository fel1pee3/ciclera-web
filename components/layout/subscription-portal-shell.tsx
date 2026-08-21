'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { Brand } from '@/components/landing/brand'
import type { AuthenticatedAccount } from '@/features/auth/contracts'
import { LogoutButton } from '@/features/auth/logout-button'
import { AccountSummary } from './account-summary'

export function SubscriptionPortalShell({
  account,
  children,
}: {
  account: AuthenticatedAccount
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh bg-background">
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <header className="border-b bg-card/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[4.5rem] w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Ciclera — página inicial"
            className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Brand />
          </Link>
          <div className="ml-auto hidden min-w-0 max-w-64 sm:block">
            <AccountSummary account={account} />
          </div>
          <LogoutButton className="shrink-0" />
        </div>
      </header>
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        {children}
      </main>
    </div>
  )
}
