import { clientApiRequest } from '@/lib/api/client'
import {
  evidenceReadUrlSchema,
  reviewDetailsSchema,
  reviewQueueSchema,
  correctionResponseSchema,
  approvalResponseSchema,
  type ReviewReason,
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

export function requestCorrection(
  workOrderId: string,
  input: { version: number; reason: ReviewReason; description: string },
) {
  return clientApiRequest(
    `reviews/work-orders/${workOrderId}/request-correction`,
    correctionResponseSchema,
    { method: 'POST', json: input, retryAfterUnauthorized: true },
  )
}

export function approveReview(workOrderId: string, version: number) {
  return clientApiRequest(
    `work-orders/${workOrderId}/approve`,
    approvalResponseSchema,
    {
      method: 'POST',
      json: { version },
      retryAfterUnauthorized: true,
    },
  )
}
