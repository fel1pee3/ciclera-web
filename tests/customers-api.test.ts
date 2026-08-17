import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createCustomer,
  listCustomers,
  listLocations,
} from '@/features/customers/api'

describe('customers API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sends pagination and filters without an organization identifier', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ items: [], page: 2, pageSize: 12, total: 0 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await listCustomers({
      page: 2,
      pageSize: 12,
      search: 'ciclo',
      archive: 'ALL',
    })

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      'customers?page=2&pageSize=12&archive=ALL&search=ciclo',
    )
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain('organizationId')
  })

  it('normalizes optional customer fields before creation', async () => {
    const id = '30000000-0000-4000-8000-000000000001'
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          id,
          name: 'Ciclera Cliente',
          document: null,
          email: null,
          phone: null,
          notes: null,
          archivedAt: null,
          createdAt: '2026-08-16T00:00:00.000Z',
          updatedAt: '2026-08-16T00:00:00.000Z',
        },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await createCustomer({
      name: ' Ciclera Cliente ',
      documentType: 'CNPJ',
      document: '',
      email: '',
      phone: '',
      notes: '',
    })

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      name: 'Ciclera Cliente',
      document: null,
      email: null,
      phone: null,
      notes: null,
    })
  })

  it('sends document and phone with digits only', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          id: '30000000-0000-4000-8000-000000000001',
          name: 'Cliente CPF',
          document: '12345678901',
          email: 'cliente@example.test',
          phone: '5585933449080',
          notes: null,
          archivedAt: null,
          createdAt: '2026-08-16T00:00:00.000Z',
          updatedAt: '2026-08-16T00:00:00.000Z',
        },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await createCustomer({
      name: 'Cliente CPF',
      documentType: 'CPF',
      document: '123.456.789-01',
      email: 'cliente@example.test',
      phone: '+55 (85) 93344-9080',
      notes: '',
    })

    expect(
      JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)),
    ).toMatchObject({
      document: '12345678901',
      phone: '5585933449080',
    })
  })

  it('uses the customer-scoped endpoint for remote location pagination', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ items: [], page: 1, pageSize: 20, total: 0 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await listLocations('30000000-0000-4000-8000-000000000001', {
      page: 1,
      pageSize: 20,
      search: 'matriz',
      status: 'ACTIVE',
    })

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      'customers/30000000-0000-4000-8000-000000000001/locations?page=1&pageSize=20&search=matriz&status=ACTIVE',
    )
  })
})
