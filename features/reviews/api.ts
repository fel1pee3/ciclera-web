import { clientApiRequest } from '@/lib/api/client'
import {
  evidenceReadUrlSchema,
  reviewDetailsSchema,
  reviewQueueSchema,
} from './contracts'

export function listReviews(input: {
  page: number
  pageSize: number
  orderBy: 'AGING_DESC' | 'EXPECTED_AMOUNT_DESC'
}) {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
    orderBy: input.orderBy,
  })
  return clientApiRequest(`reviews/queue?${params}`, reviewQueueSchema, {
    retryAfterUnauthorized: true,
  })
}

export function findReview(workOrderId: string) {
  return clientApiRequest(
    `reviews/work-orders/${workOrderId}`,
    reviewDetailsSchema,
    {
      retryAfterUnauthorized: true,
    },
  )
}

export function getReviewEvidenceReadUrl(evidenceId: string) {
  return clientApiRequest(
    `reviews/evidence/${evidenceId}/read-url`,
    evidenceReadUrlSchema,
    { retryAfterUnauthorized: true },
  )
}
