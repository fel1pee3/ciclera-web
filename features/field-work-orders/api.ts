import { clientApiRequest } from '@/lib/api/client'
import {
  fieldWorkOrderPageSchema,
  fieldWorkOrderSchema,
  type FieldView,
} from './contracts'

export function listFieldWorkOrders(query: {
  page: number
  pageSize: number
  view?: FieldView
}) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })
  if (query.view) params.set('view', query.view)
  return clientApiRequest(
    `field/work-orders?${params}`,
    fieldWorkOrderPageSchema,
    {
      retryAfterUnauthorized: true,
    },
  )
}

export function findFieldWorkOrder(workOrderId: string) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}`,
    fieldWorkOrderSchema,
    {
      retryAfterUnauthorized: true,
    },
  )
}

export function startFieldWorkOrder(workOrderId: string, version: number) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/start`,
    fieldWorkOrderSchema,
    {
      method: 'POST',
      json: { version },
      retryAfterUnauthorized: true,
    },
  )
}

export function saveFieldWorkOrderExecution(
  workOrderId: string,
  input: { version: number; notes: string | null },
) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/execution`,
    fieldWorkOrderSchema,
    {
      method: 'PATCH',
      json: input,
      retryAfterUnauthorized: true,
    },
  )
}

export function saveFieldWorkOrderChecklist(
  workOrderId: string,
  input: {
    version: number
    responses: Array<{ fieldId: string; value: string | number | boolean }>
  },
) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/execution/checklist`,
    fieldWorkOrderSchema,
    {
      method: 'PATCH',
      json: input,
      retryAfterUnauthorized: true,
    },
  )
}
