'use client'

import Link from 'next/link'
import { type ReactNode } from 'react'

import { Brand } from '@/components/landing/brand'
import { fieldNavigation } from '@/config/navigation'
import type { AuthenticatedAccount } from '@/features/auth/contracts'
import { LogoutButton } from '@/features/auth/logout-button'
import { AccountSummary } from './account-summary'
import { ShellNavigation } from './shell-navigation'

export function FieldShell({
  account,
  children,
}: {
  account: AuthenticatedAccount
  children: ReactNode
}) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-muted/20 pb-28">
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <header className="sticky top-0 z-30 border-b bg-card/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-[4.5rem] w-full max-w-5xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/field"
            aria-label="Ciclera — resumo da área de campo"
            className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Brand />
          </Link>
          <div className="ml-auto flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 max-w-64 sm:block">
              <AccountSummary account={account} />
            </div>
            <LogoutButton className="shrink-0 rounded-xl bg-muted/40" />
          </div>
        </div>
      </header>
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        {children}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 px-3 py-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur safe-area-pb sm:bottom-4 sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:px-2 sm:shadow-lg">
        <ShellNavigation items={fieldNavigation} orientation="horizontal" />
      </div>
    </div>
  )
}
