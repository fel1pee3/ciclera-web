import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createCustomer,
  listCustomers,
  listLocations,
  reactivateCustomer,
} from '@/features/customers/api'
import {
  locationFormSchema,
  toLocationPayload,
} from '@/features/customers/schemas'

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

  it('reactivates a customer through the dedicated endpoint', async () => {
    const customerId = '30000000-0000-4000-8000-000000000001'
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: customerId,
        name: 'Cliente reativado',
        document: null,
        email: null,
        phone: null,
        notes: null,
        archivedAt: null,
        createdAt: '2026-08-16T00:00:00.000Z',
        updatedAt: '2026-08-17T00:00:00.000Z',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await reactivateCustomer(customerId)

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      `customers/${customerId}/reactivate`,
    )
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST' })
  })

  it('validates and normalizes the location CEP and phone', () => {
    const input = {
      name: 'Unidade Centro',
      postalCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1578',
      complement: '',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      country: 'BR',
      contactName: 'Marcos Oliveira',
      contactPhone: '+55 (11) 3456-7890',
      accessInstructions: '',
      status: 'ACTIVE' as const,
    }

    expect(toLocationPayload(input)).toMatchObject({
      postalCode: '01310100',
      contactPhone: '551134567890',
    })
    expect(
      locationFormSchema.safeParse({
        ...input,
        postalCode: '01310',
        contactPhone: '+55 (11) 3456',
      }).success,
    ).toBe(false)
  })
})
