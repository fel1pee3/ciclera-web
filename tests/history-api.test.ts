import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findWorkOrderHistory } from '@/features/work-orders/api'

describe('work order history API', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('parses the operational timeline and safe audit data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          timeline: [
            {
              id: 'billing:1',
              type: 'BILLING',
              occurredAt: '2026-08-16T12:00:00.000Z',
              actor: {
                id: '6a69604b-aefe-460b-96c6-ef8d838ca870',
                name: 'Ana',
              },
              action: 'BILLED',
            },
          ],
          audit: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    await expect(
      findWorkOrderHistory('311a3d89-1c20-4480-a7d7-dcd317d3ed66'),
    ).resolves.toMatchObject({ timeline: [{ type: 'BILLING' }] })
  })
})
