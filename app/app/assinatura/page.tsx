'use client'

import { SubscriptionManagement } from '@/features/subscriptions/subscription-management'
import { useSession } from '@/features/auth/session-provider'

export default function SubscriptionPage() {
  const { account } = useSession()
  if (!account) return null
  return <SubscriptionManagement account={account} />
}
