import type { UserRole } from '@/features/auth/contracts'
import type { CurrentSubscription } from './contracts'

export type SubscriptionArea = 'office' | 'field'
export type SubscriptionAreaAccess = 'OPERATIONAL' | 'OWNER_PORTAL' | 'BLOCKED'

export function subscriptionAreaAccess(
  subscription: CurrentSubscription,
  role: UserRole,
  area: SubscriptionArea,
): SubscriptionAreaAccess {
  if (!subscription.enforcementEnabled || subscription.access === 'FULL') {
    return 'OPERATIONAL'
  }

  return role === 'OWNER' && area === 'office' ? 'OWNER_PORTAL' : 'BLOCKED'
}
