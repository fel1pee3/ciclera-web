import { z } from 'zod'

import { onlyDigits } from './formatters'

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum, `Use no máximo ${maximum} caracteres.`)

export const customerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Informe ao menos 2 caracteres.')
      .max(160, 'Use no máximo 160 caracteres.'),
    documentType: z.enum(['CPF', 'CNPJ']),
    document: optionalText(18),
    email: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || z.email().safeParse(value).success,
        'Informe um e-mail válido.',
      ),
    phone: optionalText(19).refine((value) => {
      const digits = onlyDigits(value)
      return digits.length === 0 || /^55\d{10,11}$/.test(digits)
    }, 'Informe o país, DDD e telefone completos.'),
    notes: optionalText(2000),
  })
  .superRefine((input, context) => {
    const digits = onlyDigits(input.document)
    const expected = input.documentType === 'CPF' ? 11 : 14
    if (digits.length > 0 && digits.length !== expected) {
      context.addIssue({
        code: 'custom',
        path: ['document'],
        message: `Informe um ${input.documentType} com ${expected} dígitos.`,
      })
    }
  })
export type CustomerFormInput = z.infer<typeof customerFormSchema>

export const locationFormSchema = z.object({
  name: z.string().trim().min(2).max(160),
  postalCode: z.string().trim().min(3).max(16),
  street: z.string().trim().min(2).max(160),
  number: z.string().trim().min(1).max(32),
  complement: optionalText(120),
  neighborhood: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  state: z
    .string()
    .trim()
    .length(2, 'Informe a sigla com 2 letras.')
    .transform((value) => value.toUpperCase()),
  country: z
    .string()
    .trim()
    .length(2, 'Informe o país com 2 letras.')
    .transform((value) => value.toUpperCase()),
  contactName: optionalText(160),
  contactPhone: optionalText(32),
  accessInstructions: optionalText(1000),
  status: z.enum(['ACTIVE', 'INACTIVE']),
})
export type LocationFormInput = z.input<typeof locationFormSchema>
export type LocationPayload = z.output<typeof locationFormSchema>

function nullable(value: string): string | null {
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function toCustomerPayload(input: CustomerFormInput) {
  return {
    name: input.name.trim(),
    document: nullableDigits(input.document),
    email: nullable(input.email),
    phone: nullableDigits(input.phone),
    notes: nullable(input.notes),
  }
}

function nullableDigits(value: string): string | null {
  const digits = onlyDigits(value)
  return digits || null
}

export function toLocationPayload(input: LocationFormInput) {
  const parsed = locationFormSchema.parse(input)
  return {
    ...parsed,
    complement: nullable(parsed.complement),
    contactName: nullable(parsed.contactName),
    contactPhone: nullable(parsed.contactPhone),
    accessInstructions: nullable(parsed.accessInstructions),
  }
}
