'use client'

import { type ReactNode } from 'react'

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
    <div className="min-h-dvh overflow-x-hidden bg-background pb-20">
      <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur">
        <div className="min-w-0 flex-1">
          <AccountSummary account={account} />
        </div>
        <LogoutButton className="shrink-0" />
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        {children}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-3 py-2 safe-area-pb">
        <ShellNavigation items={fieldNavigation} />
      </div>
    </div>
  )
}
