import { clientApiRequest } from '@/lib/api/client'
import {
  agendaSchema,
  operationalHistorySchema,
  workOrderDetailsSchema,
  workOrderPageSchema,
  type WorkOrderPriority,
  type WorkOrderStatus,
} from './contracts'
import type { WorkOrderFormInput } from './schemas'
import { toWorkOrderPayload } from './schemas'

export interface ListWorkOrdersQuery {
  page: number
  pageSize: number
  search?: string
  status?: WorkOrderStatus
  priority?: WorkOrderPriority
  customerId?: string
  locationId?: string
  equipmentId?: string
}

export function listWorkOrders(query: ListWorkOrdersQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    orderBy: 'CREATED_AT_DESC',
  })
  for (const key of [
    'search',
    'status',
    'priority',
    'customerId',
    'locationId',
    'equipmentId',
  ] as const) {
    const value = query[key]
    if (value) params.set(key, value)
  }
  return clientApiRequest(`work-orders?${params}`, workOrderPageSchema, {
    retryAfterUnauthorized: true,
  })
}

export function findWorkOrder(workOrderId: string) {
  return clientApiRequest(
    `work-orders/${workOrderId}`,
    workOrderDetailsSchema,
    {
      retryAfterUnauthorized: true,
    },
  )
}

export function findWorkOrderHistory(workOrderId: string) {
  return clientApiRequest(
    `work-orders/${workOrderId}/history`,
    operationalHistorySchema,
    { retryAfterUnauthorized: true },
  )
}

export function createWorkOrder(input: WorkOrderFormInput) {
  return clientApiRequest('work-orders', workOrderDetailsSchema, {
    method: 'POST',
    json: toWorkOrderPayload(input),
    retryAfterUnauthorized: true,
  })
}

export function updateWorkOrder(
  workOrderId: string,
  version: number,
  input: WorkOrderFormInput,
) {
  return clientApiRequest(
    `work-orders/${workOrderId}`,
    workOrderDetailsSchema,
    {
      method: 'PATCH',
      json: { version, ...toWorkOrderPayload(input) },
      retryAfterUnauthorized: true,
    },
  )
}

export function cancelWorkOrder(
  workOrderId: string,
  version: number,
  reason: string,
) {
  return clientApiRequest(
    `work-orders/${workOrderId}/cancel`,
    workOrderDetailsSchema,
    {
      method: 'POST',
      json: { version, reason: reason.trim() },
      retryAfterUnauthorized: true,
    },
  )
}

export function listAgenda(query: {
  from: string
  to: string
  technicianId?: string
  status?: WorkOrderStatus
}) {
  const params = new URLSearchParams({ from: query.from, to: query.to })
  if (query.technicianId) params.set('technicianId', query.technicianId)
  if (query.status) params.set('status', query.status)
  return clientApiRequest(`work-orders/agenda?${params}`, agendaSchema, {
    retryAfterUnauthorized: true,
  })
}

export function scheduleWorkOrder(
  workOrderId: string,
  input: {
    version: number
    technicianId: string
    scheduledStartAt: string
    scheduledEndAt: string
  },
) {
  return planningRequest(workOrderId, 'schedule', input)
}

export function rescheduleWorkOrder(
  workOrderId: string,
  input: { version: number; scheduledStartAt: string; scheduledEndAt: string },
) {
  return planningRequest(workOrderId, 'reschedule', input)
}

export function reassignWorkOrder(
  workOrderId: string,
  input: { version: number; technicianId: string },
) {
  return planningRequest(workOrderId, 'reassign', input)
}

function planningRequest(workOrderId: string, action: string, json: object) {
  return clientApiRequest(
    `work-orders/${workOrderId}/${action}`,
    workOrderDetailsSchema,
    { method: 'POST', json, retryAfterUnauthorized: true },
  )
}
