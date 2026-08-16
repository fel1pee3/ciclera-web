import { z } from 'zod'

const optionalDate = z.string()

export const workOrderFormSchema = z
  .object({
    customerId: z.string().uuid('Selecione um cliente.'),
    locationId: z.string().uuid('Selecione um local.'),
    equipmentId: z.string(),
    serviceType: z.string().trim().min(2).max(120),
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().min(2).max(4000),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
    scheduledStartAt: optionalDate,
    scheduledEndAt: optionalDate,
    expectedAmount: z
      .string()
      .trim()
      .refine((value) => !value || /^\d+(?:[,.]\d{1,2})?$/.test(value), {
        message: 'Informe um valor válido em reais.',
      }),
  })
  .refine(
    (value) =>
      !value.scheduledStartAt ||
      !value.scheduledEndAt ||
      new Date(value.scheduledEndAt) > new Date(value.scheduledStartAt),
    {
      path: ['scheduledEndAt'],
      message: 'O término deve ser posterior ao início.',
    },
  )

export type WorkOrderFormInput = z.infer<typeof workOrderFormSchema>

export function toWorkOrderPayload(input: WorkOrderFormInput) {
  return {
    customerId: input.customerId,
    locationId: input.locationId,
    equipmentId: input.equipmentId || null,
    serviceType: input.serviceType.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    priority: input.priority,
    scheduledStartAt: input.scheduledStartAt
      ? new Date(input.scheduledStartAt).toISOString()
      : null,
    scheduledEndAt: input.scheduledEndAt
      ? new Date(input.scheduledEndAt).toISOString()
      : null,
    expectedAmountInCents: moneyToCents(input.expectedAmount),
  }
}

export function moneyToCents(value: string): string | null {
  const normalized = value.trim().replace(',', '.')
  if (!normalized) return null
  const [whole, fraction = ''] = normalized.split('.')
  return `${whole}${fraction.padEnd(2, '0')}`.replace(/^0+(?=\d)/, '')
}

export function centsToMoney(value: string | null): string {
  if (!value) return ''
  return `${value.slice(0, -2) || '0'},${value.slice(-2).padStart(2, '0')}`
}

export function toLocalDateTime(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
