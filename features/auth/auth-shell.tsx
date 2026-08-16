import Link from 'next/link'
import type { ReactNode } from 'react'

import { Brand } from '@/components/landing/brand'

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="container-page grid min-h-screen place-items-center py-10 sm:py-16">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="Voltar para a página inicial">
          <Brand />
        </Link>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </main>
  )
}
