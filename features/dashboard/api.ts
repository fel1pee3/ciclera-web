import { clientApiRequest } from '@/lib/api/client'
import { dashboardSummarySchema } from './contracts'

export function getDashboardSummary(period: { from: string; to: string }) {
  const params = new URLSearchParams(period)
  return clientApiRequest(
    `dashboard/summary?${params}`,
    dashboardSummarySchema,
    {
      retryAfterUnauthorized: true,
    },
  )
}
