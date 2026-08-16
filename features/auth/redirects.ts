import type { UserRole } from './contracts'

export function roleHome(role: UserRole): '/app' | '/field' {
  return role === 'TECHNICIAN' ? '/field' : '/app'
}

export function safeReturnPath(
  candidate: string | null | undefined,
  role: UserRole,
): string {
  const fallback = roleHome(role)

  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback
  }

  try {
    const parsed = new URL(candidate, 'https://app.ciclera.local')
    if (parsed.origin !== 'https://app.ciclera.local') return fallback

    const allowedPrefix = role === 'TECHNICIAN' ? '/field' : '/app'
    return parsed.pathname === allowedPrefix ||
      parsed.pathname.startsWith(`${allowedPrefix}/`)
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback
  } catch {
    return fallback
  }
}
