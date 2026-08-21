'use client'

import type { ReactNode } from 'react'

import { fieldRoles } from '@/config/navigation'
import { ProtectedArea } from '@/features/auth/protected-area'
import { SessionProvider, useSession } from '@/features/auth/session-provider'
import { FieldSubscriptionArea } from '@/features/subscriptions/subscription-area'
import { SubscriptionProvider } from '@/features/subscriptions/subscription-provider'

function AuthenticatedField({ children }: { children: ReactNode }) {
  const { account } = useSession()
  if (!account) return null
  return (
    <SubscriptionProvider>
      <FieldSubscriptionArea account={account}>
        {children}
      </FieldSubscriptionArea>
    </SubscriptionProvider>
  )
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
