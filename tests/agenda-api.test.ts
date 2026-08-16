import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  listAgenda,
  reassignWorkOrder,
  scheduleWorkOrder,
} from '@/features/work-orders/api'

const order = {
  id: '60000000-0000-4000-8000-000000000001',
  number: 'OS-000001',
  customerId: '60000000-0000-4000-8000-000000000002',
  locationId: '60000000-0000-4000-8000-000000000003',
  equipmentId: null,
  serviceType: 'Manutenção',
  title: 'Atendimento',
  description: 'Descrição',
  priority: 'NORMAL',
  status: 'SCHEDULED',
  scheduledStartAt: '2026-08-17T12:00:00.000Z',
  scheduledEndAt: '2026-08-17T13:00:00.000Z',
  actualStartAt: null,
  actualEndAt: null,
  expectedAmountInCents: null,
  finalAmountInCents: null,
  version: 2,
  createdByUserId: '60000000-0000-4000-8000-000000000004',
  canceledByUserId: null,
  canceledAt: null,
  cancellationReason: null,
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T00:00:00.000Z',
  history: [],
  assignments: [],
}

describe('agenda API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('queries the server period, technician and status', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        items: [],
        timezone: 'America/Sao_Paulo',
        from: '2026-08-17',
        to: '2026-08-23',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    await listAgenda({
      from: '2026-08-17',
      to: '2026-08-23',
      technicianId: order.createdByUserId,
      status: 'SCHEDULED',
    })
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      `work-orders/agenda?from=2026-08-17&to=2026-08-23&technicianId=${order.createdByUserId}&status=SCHEDULED`,
    )
  })

  it('uses semantic actions with optimistic versions', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() => Promise.resolve(Response.json(order)))
    vi.stubGlobal('fetch', fetchMock)
    await scheduleWorkOrder(order.id, {
      version: 1,
      technicianId: order.createdByUserId,
      scheduledStartAt: order.scheduledStartAt,
      scheduledEndAt: order.scheduledEndAt,
    })
    await reassignWorkOrder(order.id, {
      version: 2,
      technicianId: order.createdByUserId,
    })
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/schedule')
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/reassign')
  })
})
