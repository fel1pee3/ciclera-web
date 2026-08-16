import { z } from 'zod'

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum, `Use no máximo ${maximum} caracteres.`)

export const customerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe ao menos 2 caracteres.')
    .max(160, 'Use no máximo 160 caracteres.'),
  document: optionalText(32),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || z.email().safeParse(value).success,
      'Informe um e-mail válido.',
    ),
  phone: optionalText(32),
  notes: optionalText(2000),
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
    document: nullable(input.document),
    email: nullable(input.email),
    phone: nullable(input.phone),
    notes: nullable(input.notes),
  }
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
