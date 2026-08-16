import { ApiError } from '@/lib/api/errors'

const messages: Record<string, string> = {
  EQUIPMENT_NOT_FOUND: 'Equipamento não encontrado.',
  EQUIPMENT_RELATION_INVALID:
    'Selecione um cliente e um local ativos da sua organização.',
  EQUIPMENT_SERIAL_CONFLICT:
    'Já existe um equipamento com este serial na organização.',
  EQUIPMENT_MANAGEMENT_FORBIDDEN: 'Seu perfil não pode gerenciar equipamentos.',
}

export function getEquipmentErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a operação. Tente novamente.'
  }
  return error.problem?.code
    ? (messages[error.problem.code] ?? error.problem.detail)
    : 'Não foi possível concluir a operação. Tente novamente.'
}
