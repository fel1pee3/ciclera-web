import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { VercelAnalytics } from '@/components/vercel-analytics'

vi.mock('@vercel/analytics/next', () => ({
  Analytics: () => <span>Analytics enabled</span>,
}))

const originalVercel = process.env.VERCEL

afterEach(() => {
  if (originalVercel === undefined) {
    delete process.env.VERCEL
    return
  }

  process.env.VERCEL = originalVercel
})

describe('VercelAnalytics', () => {
  it('does not render when VERCEL is absent', () => {
    delete process.env.VERCEL

    const { container } = render(<VercelAnalytics />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders when VERCEL is 1', () => {
    process.env.VERCEL = '1'

    const { container } = render(<VercelAnalytics />)

    expect(container).not.toBeEmptyDOMElement()
  })
})
