import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cancelWorkOrder,
  createWorkOrder,
  listWorkOrders,
} from '@/features/work-orders/api'

const response = {
  id: '60000000-0000-4000-8000-000000000001',
  number: 'OS-000001',
  customerId: '60000000-0000-4000-8000-000000000002',
  locationId: '60000000-0000-4000-8000-000000000003',
  equipmentId: null,
  serviceType: 'Manutenção',
  title: 'Revisar equipamento',
  description: 'Descrição',
  priority: 'NORMAL',
  status: 'DRAFT',
  scheduledStartAt: null,
  scheduledEndAt: null,
  actualStartAt: null,
  actualEndAt: null,
  expectedAmountInCents: '15000',
  finalAmountInCents: null,
  version: 1,
  createdByUserId: '60000000-0000-4000-8000-000000000004',
  canceledByUserId: null,
  canceledAt: null,
  cancellationReason: null,
  createdAt: '2026-08-16T00:00:00.000Z',
  updatedAt: '2026-08-16T00:00:00.000Z',
  history: [],
  assignments: [],
  additionalItems: [],
  additionalTotalInCents: '0',
}

describe('work order API client', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('keeps filters and paging on the server', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ items: [], page: 2, pageSize: 12, total: 0 }),
      )
    vi.stubGlobal('fetch', fetchMock)
    await listWorkOrders({
      page: 2,
      pageSize: 12,
      search: 'OS-1',
      status: 'DRAFT',
      priority: 'HIGH',
    })
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      'work-orders?page=2&pageSize=12&orderBy=CREATED_AT_DESC&search=OS-1&status=DRAFT&priority=HIGH',
    )
  })
  it('converts BRL to integer cents and never sends tenant or status', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response))
    vi.stubGlobal('fetch', fetchMock)
    await createWorkOrder({
      customerId: response.customerId,
      locationId: response.locationId,
      equipmentId: '',
      serviceType: response.serviceType,
      title: response.title,
      description: response.description,
      priority: 'NORMAL',
      scheduledStartAt: '',
      scheduledEndAt: '',
      expectedAmount: '150,00',
    })
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    expect(body).toMatchObject({
      expectedAmountInCents: '15000',
      equipmentId: null,
    })
    expect(body).not.toHaveProperty('organizationId')
    expect(body).not.toHaveProperty('status')
  })
  it('uses the semantic cancellation endpoint with optimistic version', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(Response.json({ ...response, status: 'CANCELED' }))
    vi.stubGlobal('fetch', fetchMock)
    await cancelWorkOrder(response.id, 3, 'Cliente solicitou')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      `${response.id}/cancel`,
    )
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      version: 3,
      reason: 'Cliente solicitou',
    })
  })
})
