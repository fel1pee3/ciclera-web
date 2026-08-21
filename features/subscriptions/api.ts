import { clientApiRequest } from '@/lib/api/client'
import {
  checkoutResponseSchema,
  currentSubscriptionSchema,
  plansResponseSchema,
  type PlanCode,
} from './contracts'

export function listSubscriptionPlans() {
  return clientApiRequest('subscriptions/plans', plansResponseSchema, {
    retryAfterUnauthorized: true,
  })
}

export function getCurrentSubscription() {
  return clientApiRequest('subscriptions/current', currentSubscriptionSchema, {
    retryAfterUnauthorized: true,
  })
}

export function createSubscriptionCheckout(
  planCode: PlanCode,
  paymentMethod: 'CREDIT_CARD' | 'PIX' | 'BOLETO',
) {
  return clientApiRequest('subscriptions/checkout', checkoutResponseSchema, {
    method: 'POST',
    json: { planCode, paymentMethod },
    retryAfterUnauthorized: true,
  })
}

export function changeSubscriptionPlan(planCode: PlanCode) {
  return clientApiRequest(
    'subscriptions/change-plan',
    currentSubscriptionSchema,
    {
      method: 'POST',
      json: { planCode },
      retryAfterUnauthorized: true,
    },
  )
}

export function cancelSubscription() {
  return clientApiRequest('subscriptions/cancel', currentSubscriptionSchema, {
    method: 'POST',
    retryAfterUnauthorized: true,
  })
}
