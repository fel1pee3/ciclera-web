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

export const workOrderAssignmentSchema = z.object({
  id: z.string().uuid(),
  technicianId: z.string().uuid(),
  technicianName: z.string(),
  assignedByUserId: z.string().uuid(),
  assignedAt: z.string().datetime(),
  unassignedByUserId: z.string().uuid().nullable(),
  unassignedAt: z.string().datetime().nullable(),
})
export type WorkOrderAssignment = z.infer<typeof workOrderAssignmentSchema>

export const workOrderAdditionalItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['MATERIAL', 'SERVICE', 'ADDITIONAL_HOUR']),
  description: z.string(),
  quantity: z.string(),
  unitAmountInCents: z.string(),
  totalAmountInCents: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const workOrderDetailsSchema = workOrderSchema.extend({
  history: z.array(workOrderHistorySchema),
  assignments: z.array(workOrderAssignmentSchema),
  additionalItems: z.array(workOrderAdditionalItemSchema),
  additionalTotalInCents: z.string(),
})
export type WorkOrderDetails = z.infer<typeof workOrderDetailsSchema>

export const workOrderPageSchema = z.object({
  items: z.array(workOrderSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type WorkOrderPage = z.infer<typeof workOrderPageSchema>

export const agendaItemSchema = workOrderSchema.extend({
  activeAssignment: workOrderAssignmentSchema,
})
export type AgendaItem = z.infer<typeof agendaItemSchema>

export const agendaSchema = z.object({
  items: z.array(agendaItemSchema),
  timezone: z.string(),
  from: z.string(),
  to: z.string(),
})
export type Agenda = z.infer<typeof agendaSchema>
