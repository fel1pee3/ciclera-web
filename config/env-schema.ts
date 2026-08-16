import { z } from 'zod'

const DEFAULT_CONTACT_EMAIL = 'contatociclera@gmail.com'

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .trim()
    .min(1, 'is required')
    .refine(isHttpOrigin, 'must be a valid HTTP(S) origin')
    .transform(normalizeOrigin),
  NEXT_PUBLIC_API_URL: z
    .string()
    .trim()
    .min(1, 'is required')
    .refine(isHttpOrigin, 'must be a valid HTTP(S) origin')
    .transform(normalizeOrigin),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .transform((value) => value.replace(/\D/g, ''))
      .pipe(z.string().min(8).max(15))
      .optional(),
  ),
  NEXT_PUBLIC_CONTACT_EMAIL: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().email('must be a valid email').optional(),
  ),
})

export interface PublicEnvironment {
  NEXT_PUBLIC_APP_URL: string
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_WHATSAPP_NUMBER?: string
  NEXT_PUBLIC_CONTACT_EMAIL: string
}

export function parsePublicEnvironment(
  values: Record<string, unknown>,
): PublicEnvironment {
  const result = publicEnvironmentSchema.safeParse(values)

  if (!result.success) {
    throwEnvironmentError('public', result.error.issues)
  }

  return {
    ...result.data,
    NEXT_PUBLIC_CONTACT_EMAIL:
      result.data.NEXT_PUBLIC_CONTACT_EMAIL ?? DEFAULT_CONTACT_EMAIL,
  }
}

function emptyStringToUndefined(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value
}

function isHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      isHttpUrl(value) &&
      url.pathname === '/' &&
      url.search === '' &&
      url.hash === '' &&
      url.username === '' &&
      url.password === ''
    )
  } catch {
    return false
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.username === '' &&
      url.password === ''
    )
  } catch {
    return false
  }
}

function normalizeOrigin(value: string): string {
  return new URL(value).origin
}

function throwEnvironmentError(
  scope: 'public',
  issues: z.core.$ZodIssue[],
): never {
  const details = issues
    .map(
      (issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`,
    )
    .join('; ')

  throw new Error(`Invalid ${scope} environment configuration: ${details}`)
}
