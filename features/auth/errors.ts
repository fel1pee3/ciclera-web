import { ApiError } from '@/lib/api/errors'

type AuthOperation = 'login' | 'session' | 'forgot-password' | 'reset-password'

export function getAuthErrorMessage(
  error: unknown,
  operation: AuthOperation,
): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível concluir a solicitação. Tente novamente.'
  }

  if (error.status === 401) {
    return operation === 'login'
      ? 'E-mail ou senha inválidos.'
      : 'Sua sessão expirou. Entre novamente.'
  }

  if (error.status === 403) {
    return 'A solicitação foi bloqueada por segurança. Recarregue a página e tente novamente.'
  }

  if (error.status === 422) {
    return 'Revise os campos informados.'
  }

  if (error.status === 503) {
    return 'O serviço está temporariamente indisponível. Tente novamente mais tarde.'
  }

  if (
    operation === 'reset-password' &&
    error.problem?.code === 'INVALID_PASSWORD_RESET_TOKEN'
  ) {
    return 'Este link é inválido, expirou ou já foi utilizado.'
  }

  return 'Não foi possível concluir a solicitação. Tente novamente.'
}

export function getApiFieldErrors(
  error: unknown,
): Record<string, string[]> | undefined {
  return error instanceof ApiError ? error.problem?.fieldErrors : undefined
}
