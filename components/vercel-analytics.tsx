import { Analytics } from '@vercel/analytics/next'

export function VercelAnalytics() {
  if (process.env.VERCEL !== '1') {
    return null
  }

  return <Analytics />
}
