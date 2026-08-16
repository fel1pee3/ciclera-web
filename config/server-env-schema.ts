import { z } from 'zod'

const serverEnvironmentSchema = z.object({
  LEAD_WEBHOOK_URL: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .url('must be a valid URL')
      .refine(isHttpUrl, 'must use HTTP or HTTPS')
      .optional(),
  ),
})

export interface ServerEnvironment {
  LEAD_WEBHOOK_URL?: string
}

export function parseServerEnvironment(
  values: Record<string, unknown>,
): ServerEnvironment {
  const result = serverEnvironmentSchema.safeParse(values)
  if (result.success) return result.data

  const details = result.error.issues
    .map(
      (issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`,
    )
    .join('; ')
  throw new Error(`Invalid server environment configuration: ${details}`)
}

function emptyStringToUndefined(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value
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
