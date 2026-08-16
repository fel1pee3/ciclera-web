import { ApiError } from '@/lib/api/errors'

const messages: Partial<Record<string, string>> = {
  CUSTOMER_DOCUMENT_CONFLICT:
    'Este documento já pertence a outro cliente da organização.',
  CUSTOMER_NOT_FOUND: 'Este cliente não está mais disponível.',
  LOCATION_NOT_FOUND: 'Este local não está mais disponível.',
  CUSTOMER_ARCHIVED: 'Clientes arquivados não podem receber novos locais.',
  CUSTOMER_MANAGEMENT_FORBIDDEN:
    'Seu perfil não permite gerenciar clientes e locais.',
}

export function getCustomerErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a operação. Tente novamente.'
  }
  return (
    (error.problem?.code ? messages[error.problem.code] : undefined) ??
    (error.status === 503
      ? 'O serviço está temporariamente indisponível.'
      : 'Não foi possível concluir a operação. Tente novamente.')
  )
}
