import { afterEach, describe, expect, it, vi } from 'vitest'

import { createEquipment, listEquipment } from '@/features/equipment/api'

describe('equipment API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sends server paging and search filters', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ items: [], page: 2, pageSize: 12, total: 0 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await listEquipment({
      page: 2,
      pageSize: 12,
      archive: 'ALL',
      search: 'bomba',
      customerId: '50000000-0000-4000-8000-000000000002',
    })

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      'equipment?page=2&pageSize=12&archive=ALL&search=bomba&customerId=50000000-0000-4000-8000-000000000002',
    )
  })

  it('creates equipment without accepting a tenant field', async () => {
    const response = {
      id: '50000000-0000-4000-8000-000000000001',
      customerId: '50000000-0000-4000-8000-000000000002',
      locationId: '50000000-0000-4000-8000-000000000003',
      name: 'Bomba',
      identifier: 'BMB-01',
      category: 'Bomba',
      brand: null,
      model: null,
      serialNumber: null,
      notes: null,
      archivedAt: null,
      createdAt: '2026-08-16T00:00:00.000Z',
      updatedAt: '2026-08-16T00:00:00.000Z',
    }
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response))
    vi.stubGlobal('fetch', fetchMock)

    await createEquipment({
      customerId: response.customerId,
      locationId: response.locationId,
      name: response.name,
      identifier: response.identifier,
      category: response.category,
      brand: '',
      model: '',
      serialNumber: '',
      notes: '',
    })

    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))
    expect(body).not.toHaveProperty('organizationId')
    expect(body).toMatchObject({ brand: null, serialNumber: null })
  })
})
