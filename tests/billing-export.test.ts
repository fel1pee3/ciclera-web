import { beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadBillingCsv } from '@/features/billing/api'

describe('billing export', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('downloads CSV using the exact screen filters', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('\uFEFF"numero"\r\n', {
        status: 200,
        headers: { 'Content-Type': 'text/csv; charset=utf-8' },
      }),
    )
    await downloadBillingCsv({
      page: 2,
      pageSize: 20,
      customerId: '311a3d89-1c20-4480-a7d7-dcd317d3ed66',
      minimumAmountInCents: '9007199254740993',
    })
    const url = fetchMock.mock.calls[0]?.[0].toString() ?? ''
    expect(url).toContain('billing/ready/export.csv?')
    expect(url).toContain('customerId=311a3d89-1c20-4480-a7d7-dcd317d3ed66')
    expect(url).toContain('minimumAmountInCents=9007199254740993')
  })
})
