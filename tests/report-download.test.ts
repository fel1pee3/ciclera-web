import { beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadServiceReport } from '@/features/work-orders/api'

describe('service report download', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('downloads private PDF with credentials and no public URL persistence', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Uint8Array([37, 80, 68, 70]), {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' },
      }),
    )
    const blob = await downloadServiceReport(
      '311a3d89-1c20-4480-a7d7-dcd317d3ed66',
    )
    expect(blob.type).toBe('application/pdf')
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: 'include',
      cache: 'no-store',
    })
  })
})
