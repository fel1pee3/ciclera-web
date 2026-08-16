import 'server-only'

import { cookies } from 'next/headers'
import type { z } from 'zod'

import { publicEnvironment } from '@/config/public-env'
import { buildApiUrl } from './config'
import { parseApiResponse } from './response'

const forwardedCookieNames = new Set(['ciclera_access', 'ciclera_refresh'])

interface ServerRequestOptions extends Omit<RequestInit, 'body'> {
  json?: unknown
}

export async function serverApiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ServerRequestOptions = {},
): Promise<T> {
  const { json, ...requestInit } = options
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .filter((cookie) => forwardedCookieNames.has(cookie.name))
    .map((cookie) => `${cookie.name}=${encodeURIComponent(cookie.value)}`)
    .join('; ')
  const headers = new Headers(requestInit.headers)

  headers.set('Origin', publicEnvironment.NEXT_PUBLIC_APP_URL)
  if (cookieHeader) headers.set('Cookie', cookieHeader)
  if (json !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(buildApiUrl(path), {
    ...requestInit,
    headers,
    body: json === undefined ? undefined : JSON.stringify(json),
    cache: 'no-store',
  })

  return parseApiResponse(response, schema)
}
