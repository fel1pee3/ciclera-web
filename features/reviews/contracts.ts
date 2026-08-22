import { z } from 'zod'
import {
  additionalItemSchema,
  evidenceSchema,
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
    evidence: z.array(evidenceSchema.omit({ createdAt: true })),
    additionalItems: z.array(
      additionalItemSchema.omit({ createdAt: true, updatedAt: true }),
    ),
  }),
  reviews: z.array(
    z.object({
      id: z.string().uuid(),
      decision: z.enum(['CORRECTION_REQUESTED', 'APPROVED']),
      reason: z.string().nullable(),
      description: z.string().nullable(),
      actorUserId: z.string().uuid(),
      actorName: z.string(),
      createdAt: z.string().datetime(),
    }),
  ),
})
export type ReviewDetails = z.infer<typeof reviewDetailsSchema>

export const evidenceReadUrlSchema = z.object({
  url: z.string(),
  expiresAt: z.string().datetime(),
})

export const reviewReasons = [
  'REQUIRED_PHOTO_MISSING',
  'MATERIAL_WITHOUT_VALUE',
  'ADDITIONAL_SERVICE_UNAPPROVED',
  'EQUIPMENT_DATA_INCORRECT',
  'INCONSISTENT_SCHEDULE',
  'OTHER',
] as const
export type ReviewReason = (typeof reviewReasons)[number]

export const correctionResponseSchema = z.object({
  status: z.literal('PENDING_CORRECTION'),
})

export const approvalResponseSchema = z.object({
  status: z.literal('READY_TO_BILL'),
  finalAmountInCents: z.string(),
})
