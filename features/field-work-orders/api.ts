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
