import type { ApiProblem } from './types'

export class ApiError extends Error {
  readonly status: number
  readonly problem?: ApiProblem

  constructor(message: string, status: number, problem?: ApiProblem) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
  }
}

export function isApiProblem(value: unknown): value is ApiProblem {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<ApiProblem>
  return (
    typeof candidate.type === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.status === 'number' &&
    typeof candidate.detail === 'string' &&
    typeof candidate.code === 'string'
  )
}
