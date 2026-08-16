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
  execution: z
    .object({
      id: z.string().uuid(),
      technicianId: z.string().uuid(),
      notes: z.string().nullable(),
      version: z.number().int().positive(),
      startedAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
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
