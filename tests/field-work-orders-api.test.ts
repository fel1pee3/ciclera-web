import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  findFieldWorkOrder,
  listFieldWorkOrders,
  saveFieldWorkOrderExecution,
  saveFieldWorkOrderChecklist,
  startFieldWorkOrder,
} from '@/features/field-work-orders/api'

const order = {
  id: '70000000-0000-4000-8000-000000000001',
  number: 'OS-000007',
  customer: {
    id: '70000000-0000-4000-8000-000000000002',
    name: 'Cliente',
  },
  location: {
    id: '70000000-0000-4000-8000-000000000003',
    name: 'Unidade',
    street: 'Rua Campo',
    number: '10',
    complement: null,
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
  },
  equipment: null,
  serviceType: 'Manutenção',
  title: 'Atendimento',
  description: 'Executar atendimento.',
  priority: 'NORMAL',
  status: 'SCHEDULED',
  scheduledStartAt: '2026-08-17T12:00:00.000Z',
  scheduledEndAt: '2026-08-17T13:00:00.000Z',
  actualStartAt: null,
  actualEndAt: null,
  version: 2,
  execution: null,
}

describe('field work orders API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('requests server paging and a simple view without identity parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        items: [],
        page: 2,
        pageSize: 10,
        total: 0,
        timezone: 'America/Sao_Paulo',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    await listFieldWorkOrders({ page: 2, pageSize: 10, view: 'TODAY' })
    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toContain('field/work-orders?page=2&pageSize=10&view=TODAY')
    expect(url).not.toContain('technicianId')
    expect(url).not.toContain('organizationId')
  })

  it('parses details without financial fields', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(order))
    vi.stubGlobal('fetch', fetchMock)
    const result = await findFieldWorkOrder(order.id)
    expect(result).toMatchObject({
      id: order.id,
      customer: { name: 'Cliente' },
    })
    expect(result).not.toHaveProperty('expectedAmountInCents')
  })

  it('starts and persists execution using server versions', async () => {
    const started = {
      ...order,
      status: 'IN_PROGRESS',
      version: 3,
      execution: {
        id: '70000000-0000-4000-8000-000000000010',
        technicianId: '70000000-0000-4000-8000-000000000011',
        notes: null,
        version: 1,
        startedAt: '2026-08-17T12:00:00.000Z',
        updatedAt: '2026-08-17T12:00:00.000Z',
        checklist: null,
      },
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(started))
      .mockResolvedValueOnce(
        Response.json({
          ...started,
          execution: { ...started.execution, notes: 'Confirmado', version: 2 },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await startFieldWorkOrder(order.id, 2)
    await saveFieldWorkOrderExecution(order.id, {
      version: 1,
      notes: 'Confirmado',
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`/field/work-orders/${order.id}/start`),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ version: 2 }),
      }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(`/field/work-orders/${order.id}/execution`),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ version: 1, notes: 'Confirmado' }),
      }),
    )
  })

  it('sends typed partial checklist answers with the execution version', async () => {
    const response = {
      ...order,
      status: 'IN_PROGRESS',
      execution: {
        id: '70000000-0000-4000-8000-000000000010',
        technicianId: '70000000-0000-4000-8000-000000000011',
        notes: null,
        version: 2,
        startedAt: '2026-08-17T12:00:00.000Z',
        updatedAt: '2026-08-17T12:00:00.000Z',
        checklist: null,
      },
    }
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response))
    vi.stubGlobal('fetch', fetchMock)
    await saveFieldWorkOrderChecklist(order.id, {
      version: 1,
      responses: [{ fieldId: 'operating', value: true }],
    })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/execution/checklist'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          version: 1,
          responses: [{ fieldId: 'operating', value: true }],
        }),
      }),
    )
  })
})
