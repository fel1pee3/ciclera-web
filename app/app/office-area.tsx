'use client'

import type { ReactNode } from 'react'

import { OfficeShell } from '@/components/layout/office-shell'
import { officeRoles } from '@/config/navigation'
import { ProtectedArea } from '@/features/auth/protected-area'
import { SessionProvider, useSession } from '@/features/auth/session-provider'

function AuthenticatedOffice({ children }: { children: ReactNode }) {
  const { account } = useSession()
  if (!account) return null
  return <OfficeShell account={account}>{children}</OfficeShell>
}

export function OfficeArea({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ProtectedArea allowedRoles={officeRoles}>
        <AuthenticatedOffice>{children}</AuthenticatedOffice>
      </ProtectedArea>
    </SessionProvider>
  )
}
