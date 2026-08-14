const DEFAULT_SITE_URL = 'https://ciclera.com.br'

function normalizeSiteUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  try {
    const url = new URL(withProtocol)
    return url.origin
  } catch {
    return null
  }
}

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
    ? normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)
    : null
  if (fromEnv) return fromEnv

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    const normalized = normalizeSiteUrl(vercelUrl)
    if (normalized) return normalized
  }

  return DEFAULT_SITE_URL
}
