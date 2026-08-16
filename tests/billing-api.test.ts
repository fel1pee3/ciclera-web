import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  listReadyForBilling,
  markWorkOrderBilled,
} from '@/features/billing/api'

describe('billing API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sends billing filters and parses the server total', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        items: [
          {
            id: '71000000-0000-4000-8000-000000000001',
            number: 'OS-000031',
            title: 'Ordem aprovada',
            customer: {
              id: '71000000-0000-4000-8000-000000000002',
              name: 'Cliente',
            },
            actualEndAt: '2026-08-14T12:00:00.000Z',
            approvedAt: '2026-08-15T12:00:00.000Z',
            finalAmountInCents: '12500',
            version: 6,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
        totalAmountInCents: '12500',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const result = await listReadyForBilling({
      page: 1,
      pageSize: 20,
      minimumAgingDays: 1,
      minimumAmountInCents: '10000',
    })
    expect(result.totalAmountInCents).toBe('12500')
    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toContain('minimumAgingDays=1')
    expect(url).toContain('minimumAmountInCents=10000')
  })

  it('marks a work order billed using its optimistic version', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        status: 'BILLED',
        billedAt: '2026-08-16T12:00:00.000Z',
        billedByUserId: '71000000-0000-4000-8000-000000000003',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    await markWorkOrderBilled('71000000-0000-4000-8000-000000000001', 6)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/mark-billed'),
      expect.objectContaining({ method: 'POST', body: '{"version":6}' }),
    )
  })
})
