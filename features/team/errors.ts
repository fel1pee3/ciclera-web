import { ApiError } from '@/lib/api/errors'

export function getTeamErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a operação. Tente novamente.'
  }

  const messages: Partial<Record<string, string>> = {
    EMAIL_ALREADY_IN_USE: 'Este e-mail já está vinculado a outro usuário.',
    LAST_OWNER_REQUIRED:
      'A organização precisa manter ao menos um proprietário ativo.',
    USER_MANAGEMENT_FORBIDDEN:
      'Seu perfil não permite gerenciar este integrante.',
    USER_NOT_FOUND: 'Este integrante não está mais disponível.',
    EMPTY_USER_UPDATE: 'Informe uma alteração antes de salvar.',
  }
  return (
    (error.problem?.code ? messages[error.problem.code] : undefined) ??
    (error.status === 503
      ? 'O serviço está temporariamente indisponível.'
      : 'Não foi possível concluir a operação. Tente novamente.')
  )
}
