import { afterEach, describe, expect, it, vi } from 'vitest'

import { getCurrentAccount, registerOrganization } from '@/features/auth/api'

const account = {
  user: {
    id: '10000000-0000-4000-8000-000000000101',
    name: 'Owner',
    email: 'owner@example.test',
    role: 'OWNER',
  },
  organization: {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Organization',
    timezone: 'America/Sao_Paulo',
  },
}

afterEach(() => vi.unstubAllGlobals())

describe('authenticated API client', () => {
  it('refreshes once after 401 and retries the original request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(account), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await expect(getCurrentAccount()).resolves.toEqual(account)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'http://localhost:3333/api/v1/auth/refresh',
    )
  })

  it('stops after a failed refresh without creating a loop', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: 'UNAUTHORIZED' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await expect(getCurrentAccount()).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('always uses credentialed no-store requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(account), {
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    await getCurrentAccount()
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: 'include',
      cache: 'no-store',
    })
  })

  it('never sends password confirmation and includes the current legal version', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(account), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await registerOrganization({
      organizationName: 'Empresa Tecnica',
      ownerName: 'Maria Owner',
      email: 'maria@example.test',
      password: 'LocalOnly!2026',
      confirmPassword: 'LocalOnly!2026',
      timezone: 'America/Sao_Paulo',
      termsAccepted: true,
    })

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit
    const body = JSON.parse(String(request.body)) as Record<string, unknown>
    expect(body).not.toHaveProperty('confirmPassword')
    expect(body).toMatchObject({
      termsAccepted: true,
      termsVersion: '2026-08-17',
    })
  })
})
