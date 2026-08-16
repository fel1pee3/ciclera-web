import { clientApiRequest } from '@/lib/api/client'
import {
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
