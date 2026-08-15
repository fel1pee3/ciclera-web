import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { buildApiUrl } from '@/lib/api/config'
import { parseApiResponse } from '@/lib/api/response'

describe('API foundation', () => {
  it('builds versioned API URLs from relative paths only', () => {
    expect(buildApiUrl('health')).toBe('http://localhost:3333/api/v1/health')
    expect(() => buildApiUrl('https://attacker.example')).toThrow(
      'API paths must be relative',
    )
  })

  it('validates successful JSON responses', async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' },
    })

    await expect(
      parseApiResponse(response, z.object({ ok: z.literal(true) })),
    ).resolves.toEqual({ ok: true })
  })

  it('normalizes documented API problems without exposing unknown payloads', async () => {
    const response = new Response(
      JSON.stringify({
        type: 'https://ciclera.com.br/problems/validation-error',
        title: 'Dados inválidos',
        status: 422,
        detail: 'Revise os campos informados.',
        code: 'VALIDATION_ERROR',
        requestId: 'req_test',
      }),
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    )

    await expect(parseApiResponse(response, z.unknown())).rejects.toMatchObject(
      {
        name: 'ApiError',
        status: 422,
        message: 'Revise os campos informados.',
        problem: { requestId: 'req_test' },
      },
    )
  })
})
