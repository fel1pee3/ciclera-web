'use client'

import type { ReactNode } from 'react'

import { officeRoles } from '@/config/navigation'
import { ProtectedArea } from '@/features/auth/protected-area'
import { SessionProvider, useSession } from '@/features/auth/session-provider'
import { OfficeSubscriptionArea } from '@/features/subscriptions/subscription-area'
import { SubscriptionProvider } from '@/features/subscriptions/subscription-provider'

function AuthenticatedOffice({ children }: { children: ReactNode }) {
  const { account } = useSession()
  if (!account) return null
  return (
    <SubscriptionProvider>
      <OfficeSubscriptionArea account={account}>
        {children}
      </OfficeSubscriptionArea>
    </SubscriptionProvider>
  )
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
