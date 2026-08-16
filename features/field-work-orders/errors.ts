import { ApiError } from '@/lib/api/errors'

export function getFieldWorkOrderErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return 'Atendimento não encontrado ou não atribuído a você.'
  }
  return 'Não foi possível carregar seus atendimentos. Tente novamente.'
}
