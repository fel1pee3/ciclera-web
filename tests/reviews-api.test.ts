import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  approveReview,
  findReview,
  getReviewEvidenceReadUrl,
  listReviews,
  requestCorrection,
} from '@/features/reviews/api'

const item = {
  id: '71000000-0000-4000-8000-000000000001',
  number: 'OS-000031',
  title: 'Revisar equipamento',
  priority: 'NORMAL',
  customer: {
    id: '71000000-0000-4000-8000-000000000002',
    name: 'Cliente',
  },
  expectedAmountInCents: '10000',
  additionalTotalInCents: '2500',
  waitingSince: '2026-08-16T12:00:00.000Z',
  agingSeconds: 3600,
  version: 4,
}

describe('review API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('loads the tenant review queue with server ordering and aging', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ items: [item], page: 1, pageSize: 12, total: 1 }),
      )
    vi.stubGlobal('fetch', fetchMock)
    const result = await listReviews({
      page: 1,
      pageSize: 12,
      orderBy: 'AGING_DESC',
    })
    expect(result.items[0]?.agingSeconds).toBe(3600)
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('orderBy=AGING_DESC')
  })

  it('loads consolidated details without permanent evidence URLs', async () => {
    const detail = {
      ...item,
      description: 'Descrição',
      serviceType: 'Manutenção',
      location: {
        id: '71000000-0000-4000-8000-000000000003',
        name: 'Unidade',
        address: 'Rua Um, 10',
      },
      equipment: null,
      execution: {
        id: '71000000-0000-4000-8000-000000000004',
        notes: 'Concluído',
        startedAt: '2026-08-16T11:00:00.000Z',
        updatedAt: '2026-08-16T12:00:00.000Z',
        evidence: [
          {
            id: '71000000-0000-4000-8000-000000000005',
            fileName: 'foto.jpg',
            contentType: 'image/jpeg',
            sizeBytes: '10',
            confirmedAt: '2026-08-16T11:30:00.000Z',
          },
        ],
        additionalItems: [],
      },
      reviews: [],
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(detail))
      .mockResolvedValueOnce(
        Response.json({
          url: 'reviews/evidence/id/content?token=temporary',
          expiresAt: '2026-08-16T12:05:00.000Z',
        }),
      )
    vi.stubGlobal('fetch', fetchMock)
    const result = await findReview(item.id)
    expect(result.execution.evidence[0]).not.toHaveProperty('url')
    await getReviewEvidenceReadUrl(detail.execution.evidence[0].id)
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/read-url')
  })

  it('requests an actionable correction with optimistic version', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ status: 'PENDING_CORRECTION' }))
    vi.stubGlobal('fetch', fetchMock)
    await requestCorrection(item.id, {
      version: 4,
      reason: 'EQUIPMENT_DATA_INCORRECT',
      description: 'Confirme o número de série.',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/request-correction'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          version: 4,
          reason: 'EQUIPMENT_DATA_INCORRECT',
          description: 'Confirme o número de série.',
        }),
      }),
    )
  })

  it('approves with optimistic version and parses the official total', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        status: 'READY_TO_BILL',
        finalAmountInCents: '12500',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const result = await approveReview(item.id, 4)
    expect(result.finalAmountInCents).toBe('12500')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/approve'),
      expect.objectContaining({ method: 'POST', body: '{"version":4}' }),
    )
  })
})
