import { z } from 'zod'

export const planCodeSchema = z.enum(['ESSENTIAL', 'PROFESSIONAL', 'OPERATION'])
export type PlanCode = z.infer<typeof planCodeSchema>

export const subscriptionPlanSchema = z.object({
  code: planCodeSchema,
  name: z.string(),
  priceInCents: z.number().int().positive(),
  maxTechnicians: z.number().int().positive(),
  maxAdministrativeUsers: z.number().int().positive(),
  evidenceStorageBytes: z.number().int().positive(),
  recommended: z.boolean().optional(),
})
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>

export const plansResponseSchema = z.object({
  items: z.array(subscriptionPlanSchema),
})

export const currentSubscriptionSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  planCode: planCodeSchema.nullable(),
  scheduledPlanCode: planCodeSchema.nullable(),
  status: z.enum(['PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'ENDED']),
  paymentMethod: z.enum(['CREDIT_CARD', 'PIX', 'BOLETO']).nullable(),
  currentPeriodStart: z.string().datetime().nullable(),
  currentPeriodEnd: z.string().datetime().nullable(),
  nextDueDate: z.string().datetime().nullable(),
  overdueSince: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  canceledAt: z.string().datetime().nullable(),
  enforcementEnabled: z.boolean(),
  latestInvoiceUrl: z.string().url().nullable(),
  access: z.enum(['FULL', 'READ_ONLY']),
  plan: subscriptionPlanSchema.nullable(),
  scheduledPlan: subscriptionPlanSchema.nullable(),
  usage: z.object({
    technicians: z.number().int().nonnegative(),
    administrativeUsers: z.number().int().nonnegative(),
    evidenceStorageBytes: z.number().int().nonnegative(),
  }),
})
export type CurrentSubscription = z.infer<typeof currentSubscriptionSchema>

export const checkoutResponseSchema = z.object({
  checkoutUrl: z.string().url(),
  expiresAt: z.string().datetime(),
})
