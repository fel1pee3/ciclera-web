import { z } from 'zod'

export const workOrderStatuses = [
  'DRAFT',
  'SCHEDULED',
  'IN_PROGRESS',
  'AWAITING_REVIEW',
  'PENDING_CORRECTION',
  'READY_TO_BILL',
  'BILLED',
  'CANCELED',
] as const

export const workOrderPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const
export const workOrderStatusSchema = z.enum(workOrderStatuses)
export const workOrderPrioritySchema = z.enum(workOrderPriorities)
export type WorkOrderStatus = z.infer<typeof workOrderStatusSchema>
export type WorkOrderPriority = z.infer<typeof workOrderPrioritySchema>

export const workOrderSchema = z.object({
  id: z.string().uuid(),
  number: z.string(),
  customerId: z.string().uuid(),
  locationId: z.string().uuid(),
  equipmentId: z.string().uuid().nullable(),
  serviceType: z.string(),
  title: z.string(),
  description: z.string(),
  priority: workOrderPrioritySchema,
  status: workOrderStatusSchema,
  scheduledStartAt: z.string().datetime().nullable(),
  scheduledEndAt: z.string().datetime().nullable(),
  actualStartAt: z.string().datetime().nullable(),
  actualEndAt: z.string().datetime().nullable(),
  expectedAmountInCents: z.string().nullable(),
  finalAmountInCents: z.string().nullable(),
  version: z.number().int().positive(),
  createdByUserId: z.string().uuid(),
  canceledByUserId: z.string().uuid().nullable(),
  canceledAt: z.string().datetime().nullable(),
  cancellationReason: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type WorkOrder = z.infer<typeof workOrderSchema>

export const workOrderHistorySchema = z.object({
  id: z.string().uuid(),
  previousStatus: workOrderStatusSchema.nullable(),
  newStatus: workOrderStatusSchema,
  actorUserId: z.string().uuid(),
  reason: z.string().nullable(),
  createdAt: z.string().datetime(),
})

export const workOrderDetailsSchema = workOrderSchema.extend({
  history: z.array(workOrderHistorySchema),
})
export type WorkOrderDetails = z.infer<typeof workOrderDetailsSchema>

export const workOrderPageSchema = z.object({
  items: z.array(workOrderSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type WorkOrderPage = z.infer<typeof workOrderPageSchema>
