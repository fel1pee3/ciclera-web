'use client'

import { Building2, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'

import { Brand } from '@/components/landing/brand'
import { Button } from '@/components/ui/button'
import { officeNavigation } from '@/config/navigation'
import type { AuthenticatedAccount } from '@/features/auth/contracts'
import { LogoutButton } from '@/features/auth/logout-button'
import { cn } from '@/lib/utils'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigation = officeNavigation.filter(
    (item) => !item.roles || item.roles.includes(account.user.role),
  )
  const initials = account.user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo principal
      </a>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 hidden border-r bg-card px-4 py-5 transition-[width] duration-300 ease-out lg:flex lg:flex-col',
          sidebarCollapsed ? 'w-[5.5rem]' : 'w-[17rem]',
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="absolute -right-[1.125rem] top-[1.125rem] z-40 rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary"
          aria-label={
            sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'
          }
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
        >
          {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>

        <Link
          href="/app"
          className={cn(
            'w-fit min-w-0 translate-x-2 overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
          )}
          aria-label="Ciclera — início"
        >
          <Brand compact={sidebarCollapsed} animated />
        </Link>
        <div className="mt-8 flex-1">
          <ShellNavigation items={navigation} collapsed={sidebarCollapsed} />
        </div>
        <div className="border-t pt-4">
          <LogoutButton
            compact={sidebarCollapsed}
            className="w-full justify-start transition-[padding,gap] duration-300"
          />
        </div>
      </aside>

      <div
        className={cn(
          'min-w-0 transition-[margin-left] duration-300 ease-out',
          sidebarCollapsed ? 'lg:ml-[5.5rem]' : 'lg:ml-[17rem]',
        )}
      >
        <header className="sticky top-0 z-40 flex min-h-[4.5rem] items-center gap-3 border-b bg-card/90 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <div className="hidden min-w-0 items-center gap-3 sm:flex">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Building2 aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Organização
                </p>
                <p className="truncate text-sm font-semibold">
                  {account.organization.name}
                </p>
              </div>
            </div>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="menu-escritorio"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
            <span
              aria-hidden="true"
              className="hidden size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground lg:grid"
            >
              {initials}
            </span>
            <div className="hidden max-w-56 lg:block">
              <AccountSummary account={account} showOrganization={false} />
            </div>
          </div>
        </header>

        {menuOpen ? (
          <>
            <button
              type="button"
              aria-label="Fechar menu ao tocar fora"
              className="fixed inset-x-0 bottom-0 top-[4.5rem] z-20 bg-foreground/15 backdrop-blur-[2px] lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <div
              id="menu-escritorio"
              className="fixed bottom-0 right-0 top-[4.5rem] z-30 flex w-[min(20rem,calc(100vw-3rem))] flex-col border-l bg-card p-4 shadow-2xl lg:hidden"
            >
              <div className="flex-1 overflow-y-auto">
                <ShellNavigation
                  items={navigation}
                  onNavigate={() => setMenuOpen(false)}
                />
              </div>
              <div className="mt-4 border-t pt-4">
                <LogoutButton className="w-full" />
              </div>
            </div>
          </>
        ) : null}

        <main id="conteudo" tabIndex={-1} className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
