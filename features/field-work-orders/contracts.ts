import { z } from 'zod'
import {
  workOrderPrioritySchema,
  workOrderStatusSchema,
} from '@/features/work-orders/contracts'

export const fieldViews = [
  'TODAY',
  'UPCOMING',
  'IN_PROGRESS',
  'PENDING',
] as const
export const fieldViewSchema = z.enum(fieldViews)
export type FieldView = z.infer<typeof fieldViewSchema>

export const evidenceSchema = z.object({
  id: z.string().uuid(),
  fileName: z.string(),
  contentType: z.string(),
  sizeBytes: z.string().regex(/^\d+$/),
  confirmedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
})
export type Evidence = z.infer<typeof evidenceSchema>

export const additionalItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['MATERIAL', 'SERVICE', 'ADDITIONAL_HOUR']),
  description: z.string(),
  quantity: z.string(),
  unitAmountInCents: z.string().regex(/^\d+$/),
  totalAmountInCents: z.string().regex(/^\d+$/),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type AdditionalItem = z.infer<typeof additionalItemSchema>

export const fieldWorkOrderSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  customer: z.object({ id: z.string().uuid(), name: z.string() }),
  location: z.object({
    id: z.string().uuid(),
    name: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
  }),
  equipment: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      identifier: z.string(),
    })
    .nullable(),
  serviceType: z.string(),
  title: z.string(),
  description: z.string(),
  priority: workOrderPrioritySchema,
  status: workOrderStatusSchema,
  scheduledStartAt: z.string().datetime().nullable(),
  scheduledEndAt: z.string().datetime().nullable(),
  actualStartAt: z.string().datetime().nullable(),
  actualEndAt: z.string().datetime().nullable(),
  version: z.number().int().positive(),
  currentCorrection: z
    .object({
      id: z.string().uuid(),
      reason: z.string(),
      description: z.string(),
      requestedAt: z.string().datetime(),
    })
    .nullish()
    .default(null),
  execution: z
    .object({
      id: z.string().uuid(),
      technicianId: z.string().uuid(),
      notes: z.string().nullable(),
      version: z.number().int().positive(),
      startedAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      evidence: z.array(evidenceSchema),
      additionalItems: z.array(additionalItemSchema),
      additionalTotalInCents: z.string().regex(/^\d+$/),
    })
    .nullable(),
})
export type FieldWorkOrder = z.infer<typeof fieldWorkOrderSchema>

export const fieldWorkOrderPageSchema = z.object({
  items: z.array(fieldWorkOrderSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  timezone: z.string(),
})
export type FieldWorkOrderPage = z.infer<typeof fieldWorkOrderPageSchema>

export const evidenceIntentResponseSchema = z.object({
  workOrder: fieldWorkOrderSchema,
  intent: z.object({
    evidenceId: z.string().uuid(),
    uploadUrl: z.string(),
    expiresAt: z.string().datetime(),
    method: z.literal('PUT'),
    contentType: z.string(),
  }),
})

export const evidenceReadUrlSchema = z.object({
  url: z.string(),
  expiresAt: z.string().datetime(),
})
