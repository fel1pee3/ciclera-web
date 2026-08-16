import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/config/server-env', () => ({
  serverEnvironment: { LEAD_WEBHOOK_URL: 'https://hooks.example.test/leads' },
}))

import { POST } from '@/app/api/leads/route'

const validLead = {
  name: 'Maria da Silva',
  company: 'Empresa Técnica',
  role: 'Gerente operacional',
  email: 'maria@example.test',
  whatsapp: '11999999999',
  location: 'São Paulo, SP',
  technicians: '5–10',
  monthlyOrders: '51–100',
  currentControl: 'Planilhas',
  challenge: 'Conferência manual de todas as evidências.',
  consent: true,
  website: '',
}

describe('lead route', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('only confirms success after the configured destination accepts the lead', async () => {
    const delivery = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 202 }))
    const response = await POST(request(validLead, '198.51.100.1'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(delivery).toHaveBeenCalledOnce()
    const [, init] = delivery.mock.calls[0] ?? []
    expect(init).toMatchObject({ method: 'POST' })
    expect(JSON.parse(String(init?.body))).toMatchObject({
      email: 'maria@example.test',
      source: 'landing-ciclera',
    })
    expect(String(init?.body)).not.toContain('website')
  })

  it('does not report success when delivery fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 500 }),
    )
    const response = await POST(request(validLead, '198.51.100.2'))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'Falha ao armazenar o lead.',
    })
  })

  it('rejects invalid input and the honeypot without delivering data', async () => {
    const delivery = vi.spyOn(globalThis, 'fetch')
    const invalid = await POST(
      request({ ...validLead, consent: false }, '198.51.100.3'),
    )
    const honeypot = await POST(
      request({ ...validLead, website: 'bot.example' }, '198.51.100.4'),
    )

    expect(invalid.status).toBe(400)
    expect(honeypot.status).toBe(400)
    expect(delivery).not.toHaveBeenCalled()
  })

  it('limits repeated attempts per client address', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 202 }),
    )
    const address = '198.51.100.5'
    for (let attempt = 0; attempt < 4; attempt += 1) {
      expect((await POST(request(validLead, address))).status).toBe(200)
    }
    expect((await POST(request(validLead, address))).status).toBe(429)
  })
})

function request(body: unknown, address: string) {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': address,
    },
    body: JSON.stringify(body),
  })
}
