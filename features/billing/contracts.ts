import { z } from 'zod'

export const billingReadyItemSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  title: z.string(),
  customer: z.object({ id: z.string().uuid(), name: z.string() }),
  actualEndAt: z.string().datetime(),
  approvedAt: z.string().datetime(),
  finalAmountInCents: z.string(),
  version: z.number().int().positive(),
})

export const billingReadyPageSchema = z.object({
  items: z.array(billingReadyItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalAmountInCents: z.string(),
})
export type BillingReadyPage = z.infer<typeof billingReadyPageSchema>

export const billedResponseSchema = z.object({
  status: z.literal('BILLED'),
  billedAt: z.string().datetime(),
  billedByUserId: z.string().uuid(),
})
