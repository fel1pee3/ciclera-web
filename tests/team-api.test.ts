import { afterEach, describe, expect, it, vi } from 'vitest'

import { createUser, listUsers, updateUser } from '@/features/team/api'

describe('team API client', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('sends filters to the paginated endpoint with cookie credentials', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        Response.json({ items: [], page: 2, pageSize: 12, total: 0 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await listUsers({
      page: 2,
      pageSize: 12,
      search: 'ana',
      role: 'TECHNICIAN',
      status: 'ACTIVE',
    })

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      'users?page=2&pageSize=12&search=ana&role=TECHNICIAN&status=ACTIVE',
    )
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: 'include',
      cache: 'no-store',
    })
  })

  it('posts the initial password without persisting it in Web Storage', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json(
        {
          id: '20000000-0000-4000-8000-000000000002',
          name: 'Técnica',
          email: 'tech@example.test',
          role: 'TECHNICIAN',
          status: 'ACTIVE',
          createdAt: '2026-08-16T00:00:00.000Z',
          updatedAt: '2026-08-16T00:00:00.000Z',
        },
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await createUser({
      name: 'Técnica',
      email: 'tech@example.test',
      password: 'LocalOnly!2026',
      confirmPassword: 'LocalOnly!2026',
      role: 'TECHNICIAN',
    })

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST' })
    expect(fetchMock.mock.calls[0]?.[1]?.body).toContain('LocalOnly!2026')
    expect(fetchMock.mock.calls[0]?.[1]?.body).not.toContain('confirmPassword')
  })

  it('omits blank password fields while updating member data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: '20000000-0000-4000-8000-000000000002',
        name: 'Técnica atualizada',
        email: 'updated@example.test',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: '2026-08-16T00:00:00.000Z',
        updatedAt: '2026-08-17T00:00:00.000Z',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await updateUser('20000000-0000-4000-8000-000000000002', {
      name: 'Técnica atualizada',
      email: 'updated@example.test',
      password: '',
      confirmPassword: '',
      role: 'ADMIN',
    })

    const body = String(fetchMock.mock.calls[0]?.[1]?.body)
    expect(body).toContain('updated@example.test')
    expect(body).not.toContain('password')
    expect(body).not.toContain('confirmPassword')
  })
})
