import { clientApiDownload, clientApiRequest } from '@/lib/api/client'
import { billedResponseSchema, billingReadyPageSchema } from './contracts'

export interface BillingReadyQuery {
  page: number
  pageSize: number
  customerId?: string
  completedFrom?: string
  completedTo?: string
  minimumAgingDays?: number
  minimumAmountInCents?: string
  maximumAmountInCents?: string
}

export function listReadyForBilling(query: BillingReadyQuery) {
  const params = readyParams(query)
  return clientApiRequest(`billing/ready?${params}`, billingReadyPageSchema, {
    retryAfterUnauthorized: true,
  })
}

export function downloadBillingCsv(query: BillingReadyQuery) {
  return clientApiDownload(`billing/ready/export.csv?${readyParams(query)}`)
}

function readyParams(query: BillingReadyQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })
  for (const [key, value] of Object.entries(query)) {
    if (key === 'page' || key === 'pageSize' || value === undefined) continue
    params.set(key, String(value))
  }
  return params
}

export function markWorkOrderBilled(workOrderId: string, version: number) {
  return clientApiRequest(
    `work-orders/${workOrderId}/mark-billed`,
    billedResponseSchema,
    {
      method: 'POST',
      json: { version },
      retryAfterUnauthorized: true,
    },
  )
}
