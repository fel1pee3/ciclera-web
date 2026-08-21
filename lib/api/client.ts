import type { z } from 'zod'

import { buildApiUrl } from './config'
import { parseApiResponse } from './response'

interface ClientRequestOptions extends Omit<RequestInit, 'body'> {
  json?: unknown
  retryAfterUnauthorized?: boolean
}

let refreshRequest: Promise<boolean> | null = null

export async function clientApiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ClientRequestOptions = {},
): Promise<T> {
  const { json, retryAfterUnauthorized = false, ...requestInit } = options
  const response = await send(path, json, requestInit)

  if (
    response.status === 401 &&
    retryAfterUnauthorized &&
    path !== 'auth/refresh'
  ) {
    if (await refreshSession()) {
      return parseApiResponse(await send(path, json, requestInit), schema)
    }
  }

  return parseApiResponse(response, schema)
}

export async function clientApiDownload(path: string): Promise<Blob> {
  let response = await send(path, undefined, { method: 'GET' })
  if (response.status === 401) {
    if (await refreshSession()) {
      response = await send(path, undefined, { method: 'GET' })
    }
  }
  if (!response.ok) throw new Error('DOWNLOAD_FAILED')
  return response.blob()
}

function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = send('auth/refresh', undefined, { method: 'POST' })
      .then((response) => response.ok)
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

function send(
  path: string,
  json: unknown,
  requestInit: Omit<RequestInit, 'body'>,
): Promise<Response> {
  const headers = new Headers(requestInit.headers)

  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(buildApiUrl(path), {
    ...requestInit,
    headers,
    body: json === undefined ? undefined : JSON.stringify(json),
    credentials: 'include',
    cache: 'no-store',
  })
}
