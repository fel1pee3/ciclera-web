'use client'

import type { ReactNode } from 'react'

import { FieldShell } from '@/components/layout/field-shell'
import { fieldRoles } from '@/config/navigation'
import { ProtectedArea } from '@/features/auth/protected-area'
import { SessionProvider, useSession } from '@/features/auth/session-provider'

function AuthenticatedField({ children }: { children: ReactNode }) {
  const { account } = useSession()
  if (!account) return null
  return <FieldShell account={account}>{children}</FieldShell>
}

export function FieldArea({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ProtectedArea allowedRoles={fieldRoles}>
        <AuthenticatedField>{children}</AuthenticatedField>
      </ProtectedArea>
    </SessionProvider>
  )
}
