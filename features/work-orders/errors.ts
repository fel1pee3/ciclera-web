import { ApiError } from '@/lib/api/errors'

const messages: Record<string, string> = {
  WORK_ORDER_NOT_FOUND: 'Ordem de serviço não encontrada.',
  WORK_ORDER_RELATION_INVALID: 'Cliente, local ou equipamento não é válido.',
  WORK_ORDER_STATUS_LOCKED:
    'Esta ordem não pode mais ser alterada como rascunho.',
  WORK_ORDER_VERSION_CONFLICT:
    'A ordem foi alterada por outra pessoa. Recarregue a página antes de tentar novamente.',
  WORK_ORDER_MANAGEMENT_FORBIDDEN: 'Seu perfil não pode gerenciar ordens.',
}

export function getWorkOrderErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a operação. Tente novamente.'
  }
  if (error.status === 409 && !error.problem?.code) {
    return 'A ordem foi alterada por outra pessoa. Recarregue a página.'
  }
  return error.problem?.code
    ? (messages[error.problem.code] ?? error.problem.detail)
    : 'Não foi possível concluir a operação. Tente novamente.'
}
