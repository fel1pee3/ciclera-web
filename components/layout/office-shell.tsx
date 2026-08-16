'use client'

import { Menu, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { officeNavigation } from '@/config/navigation'
import type { AuthenticatedAccount } from '@/features/auth/contracts'
import { LogoutButton } from '@/features/auth/logout-button'
import { AccountSummary } from './account-summary'
import { ShellNavigation } from './shell-navigation'

export function OfficeShell({
  account,
  children,
}: {
  account: AuthenticatedAccount
  children: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <aside className="hidden border-r bg-card p-5 lg:flex lg:flex-col">
        <p className="font-heading text-xl font-bold text-institutional">
          Ciclera
        </p>
        <div className="mt-8 flex-1">
          <ShellNavigation
            items={officeNavigation.filter(
              (item) => !item.roles || item.roles.includes(account.user.role),
            )}
          />
        </div>
        <div className="border-t pt-4">
          <AccountSummary account={account} />
          <LogoutButton className="mt-3 w-full justify-start" />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="menu-escritorio"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
          <p className="hidden truncate text-sm font-semibold sm:block">
            {account.organization.name}
          </p>
          <div className="ml-auto max-w-52">
            <AccountSummary account={account} />
          </div>
        </header>

        {menuOpen ? (
          <div id="menu-escritorio" className="border-b bg-card p-4 lg:hidden">
            <ShellNavigation
              items={officeNavigation.filter(
                (item) => !item.roles || item.roles.includes(account.user.role),
              )}
              onNavigate={() => setMenuOpen(false)}
            />
            <LogoutButton className="mt-3 w-full" />
          </div>
        ) : null}

        <main id="conteudo" tabIndex={-1} className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
