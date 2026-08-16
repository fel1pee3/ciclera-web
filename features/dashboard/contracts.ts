import { z } from 'zod'

const dashboardStageSchema = z.object({
  count: z.number().int().nonnegative(),
  amountInCents: z.string().regex(/^\d+$/),
})

export const dashboardStatusSchema = z.enum([
  'IN_PROGRESS',
  'AWAITING_REVIEW',
  'PENDING_CORRECTION',
  'READY_TO_BILL',
  'BILLED',
])

export const dashboardSummarySchema = z.object({
  timezone: z.string(),
  period: z.object({ from: z.string(), to: z.string() }),
  stages: z.record(dashboardStatusSchema, dashboardStageSchema),
  blockedAmountInCents: z.string().regex(/^\d+$/),
  averageReviewWaitingSeconds: z.number().int().nonnegative().nullable(),
  oldestBlocked: z.array(
    z.object({
      id: z.string().uuid(),
      number: z.string(),
      title: z.string(),
      status: z.enum(['AWAITING_REVIEW', 'PENDING_CORRECTION']),
      waitingSince: z.string().datetime(),
      agingSeconds: z.number().int().nonnegative(),
    }),
  ),
  recurringBlockers: z.array(
    z.object({ reason: z.string(), count: z.number().int().positive() }),
  ),
})

export type DashboardSummary = z.infer<typeof dashboardSummarySchema>
export type DashboardStatus = z.infer<typeof dashboardStatusSchema>
