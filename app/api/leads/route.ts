import { NextResponse } from 'next/server'
import { serverEnvironment } from '@/config/server-env'
import { leadSchema } from '@/lib/lead-schema'

const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW = 60_000
const LIMIT = 4

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = Date.now()
  const entry = attempts.get(ip)
  if (entry && entry.resetAt > now && entry.count >= LIMIT)
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde e tente novamente.' },
      { status: 429 },
    )
  attempts.set(
    ip,
    !entry || entry.resetAt <= now
      ? { count: 1, resetAt: now + WINDOW }
      : { ...entry, count: entry.count + 1 },
  )

  const parsed = leadSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Dados inválidos.', details: parsed.error.flatten() },
      { status: 400 },
    )
  if (parsed.data.website)
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 })
  const webhook = serverEnvironment.LEAD_WEBHOOK_URL
  if (!webhook)
    return NextResponse.json(
      { error: 'Serviço temporariamente indisponível.' },
      { status: 503 },
    )
  const { website, ...lead } = parsed.data
  void website
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...lead,
      source: 'landing-ciclera',
      receivedAt: new Date().toISOString(),
    }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => null)
  if (!response?.ok)
    return NextResponse.json(
      { error: 'Falha ao armazenar o lead.' },
      { status: 502 },
    )
  return NextResponse.json({ ok: true })
}
