import { clientApiRequest } from '@/lib/api/client'
import {
  fieldWorkOrderPageSchema,
  fieldWorkOrderSchema,
  type FieldView,
  evidenceIntentResponseSchema,
  evidenceReadUrlSchema,
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

export function createEvidenceIntent(
  workOrderId: string,
  input: {
    version: number
    kind: 'PHOTO' | 'SIGNATURE'
    fileName: string
    contentType: string
    sizeBytes: number
  },
) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/execution/evidence/intents`,
    evidenceIntentResponseSchema,
    { method: 'POST', json: input, retryAfterUnauthorized: true },
  )
}

export function confirmEvidence(
  workOrderId: string,
  evidenceId: string,
  version: number,
) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/execution/evidence/${evidenceId}/confirm`,
    fieldWorkOrderSchema,
    {
      method: 'POST',
      json: { version },
      retryAfterUnauthorized: true,
    },
  )
}

export function removeEvidence(
  workOrderId: string,
  evidenceId: string,
  version: number,
) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/execution/evidence/${evidenceId}`,
    fieldWorkOrderSchema,
    {
      method: 'DELETE',
      json: { version },
      retryAfterUnauthorized: true,
    },
  )
}

export function getEvidenceReadUrl(evidenceId: string) {
  return clientApiRequest(
    `field/evidence/${evidenceId}/read-url`,
    evidenceReadUrlSchema,
    { retryAfterUnauthorized: true },
  )
}

export interface AdditionalItemInput {
  version: number
  type: 'MATERIAL' | 'SERVICE' | 'ADDITIONAL_HOUR'
  description: string
  quantity: string
  unitAmountInCents: string
}

export function createAdditionalItem(
  workOrderId: string,
  input: AdditionalItemInput,
) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/execution/additional-items`,
    fieldWorkOrderSchema,
    { method: 'POST', json: input, retryAfterUnauthorized: true },
  )
}

export function updateAdditionalItem(
  workOrderId: string,
  itemId: string,
  input: AdditionalItemInput,
) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/execution/additional-items/${itemId}`,
    fieldWorkOrderSchema,
    { method: 'PATCH', json: input, retryAfterUnauthorized: true },
  )
}

export function removeAdditionalItem(
  workOrderId: string,
  itemId: string,
  version: number,
) {
  return clientApiRequest(
    `field/work-orders/${workOrderId}/execution/additional-items/${itemId}`,
    fieldWorkOrderSchema,
    {
      method: 'DELETE',
      json: { version },
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
