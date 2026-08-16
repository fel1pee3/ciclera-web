import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDashboardSummary } from '@/features/dashboard/api'

describe('dashboard API', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('uses the explicit local period and parses exact monetary strings', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          timezone: 'America/Sao_Paulo',
          period: { from: '2026-08-01', to: '2026-08-31' },
          stages: Object.fromEntries(
            [
              'IN_PROGRESS',
              'AWAITING_REVIEW',
              'PENDING_CORRECTION',
              'READY_TO_BILL',
              'BILLED',
            ].map((status) => [status, { count: 0, amountInCents: '0' }]),
          ),
          blockedAmountInCents: '0',
          averageReviewWaitingSeconds: null,
          oldestBlocked: [],
          recurringBlockers: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    await expect(
      getDashboardSummary({ from: '2026-08-01', to: '2026-08-31' }),
    ).resolves.toMatchObject({ timezone: 'America/Sao_Paulo' })
    expect(fetchMock.mock.calls[0]?.[0].toString()).toContain(
      'dashboard/summary?from=2026-08-01&to=2026-08-31',
    )
  })
})
