import { z } from 'zod'
import {
  additionalItemSchema,
  evidenceSchema,
  executionChecklistSchema,
} from '@/features/field-work-orders/contracts'
import { workOrderPrioritySchema } from '@/features/work-orders/contracts'

export const reviewQueueItemSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  title: z.string(),
  priority: workOrderPrioritySchema,
  customer: z.object({ id: z.string().uuid(), name: z.string() }),
  expectedAmountInCents: z.string().nullable(),
  additionalTotalInCents: z.string(),
  waitingSince: z.string().datetime(),
  agingSeconds: z.number().int().nonnegative(),
  version: z.number().int().positive(),
})
export type ReviewQueueItem = z.infer<typeof reviewQueueItemSchema>

export const reviewQueueSchema = z.object({
  items: z.array(reviewQueueItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type ReviewQueue = z.infer<typeof reviewQueueSchema>

export const reviewDetailsSchema = reviewQueueItemSchema.extend({
  description: z.string(),
  serviceType: z.string(),
  location: z.object({
    id: z.string().uuid(),
    name: z.string(),
    address: z.string(),
  }),
  equipment: z
    .object({ id: z.string().uuid(), name: z.string(), identifier: z.string() })
    .nullable(),
  execution: z.object({
    id: z.string().uuid(),
    notes: z.string().nullable(),
    startedAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    checklist: executionChecklistSchema.nullable(),
    evidence: z.array(evidenceSchema.omit({ createdAt: true })),
    additionalItems: z.array(
      additionalItemSchema.omit({ createdAt: true, updatedAt: true }),
    ),
  }),
})
export type ReviewDetails = z.infer<typeof reviewDetailsSchema>

export const evidenceReadUrlSchema = z.object({
  url: z.string(),
  expiresAt: z.string().datetime(),
})
