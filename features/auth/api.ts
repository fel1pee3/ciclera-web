import { z } from 'zod'

import { clientApiRequest } from '@/lib/api/client'
import {
  authenticatedAccountSchema,
  forgotPasswordResponseSchema,
  type AuthenticatedAccount,
} from './contracts'
import {
  currentLegalVersion,
  type ForgotPasswordInput,
  type LoginInput,
  type RegistrationInput,
} from './schemas'

const noContentSchema = z.null()

export function login(input: LoginInput): Promise<AuthenticatedAccount> {
  return clientApiRequest('auth/login', authenticatedAccountSchema, {
    method: 'POST',
    json: input,
  })
}

export function registerOrganization(
  input: RegistrationInput,
): Promise<AuthenticatedAccount> {
  return clientApiRequest('auth/register', authenticatedAccountSchema, {
    method: 'POST',
    json: {
      organizationName: input.organizationName,
      ownerName: input.ownerName,
      email: input.email,
      password: input.password,
      timezone: input.timezone,
      termsAccepted: input.termsAccepted,
      termsVersion: currentLegalVersion,
    },
  })
}

export function getCurrentAccount(): Promise<AuthenticatedAccount> {
  return clientApiRequest('auth/me', authenticatedAccountSchema, {
    retryAfterUnauthorized: true,
  })
}

export async function logout(): Promise<void> {
  await clientApiRequest('auth/logout', noContentSchema, { method: 'POST' })
}

export async function logoutAll(): Promise<void> {
  await clientApiRequest('auth/logout-all', noContentSchema, {
    method: 'POST',
    retryAfterUnauthorized: true,
  })
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
): Promise<string> {
  const response = await clientApiRequest(
    'auth/forgot-password',
    forgotPasswordResponseSchema,
    { method: 'POST', json: input },
  )
  return response.message
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await clientApiRequest('auth/reset-password', noContentSchema, {
    method: 'POST',
    json: { token, password },
  })
}
