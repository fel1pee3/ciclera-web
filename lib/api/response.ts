import type { z } from 'zod'

import { ApiError, isApiProblem } from './errors'

export async function parseApiResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
): Promise<T> {
  const payload = await readJsonResponse(response)

  if (!response.ok) {
    const problem = isApiProblem(payload) ? payload : undefined
    throw new ApiError(
      problem?.detail ?? 'Não foi possível concluir a solicitação.',
      response.status,
      problem,
    )
  }

  const result = schema.safeParse(payload)
  if (!result.success) {
    throw new ApiError('A API retornou uma resposta inválida.', response.status)
  }

  return result.data
}

async function readJsonResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('json')) return null

  const body = await response.text()
  if (!body.trim()) return null

  try {
    return JSON.parse(body) as unknown
  } catch {
    return null
  }
}
