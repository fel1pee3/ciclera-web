import { z } from 'zod'

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum, `Use no máximo ${maximum} caracteres.`)

export const equipmentFormSchema = z.object({
  customerId: z.string().uuid('Selecione um cliente.'),
  locationId: z.string().uuid('Selecione um local.'),
  name: z.string().trim().min(2).max(160),
  identifier: z.string().trim().min(1).max(80),
  category: z.string().trim().min(2).max(120),
  brand: optionalText(120),
  model: optionalText(120),
  serialNumber: optionalText(120),
  notes: optionalText(2000),
})
export type EquipmentFormInput = z.infer<typeof equipmentFormSchema>

function nullable(value: string): string | null {
  const normalized = value.trim()
  return normalized ? normalized : null
}

export function toEquipmentPayload(input: EquipmentFormInput) {
  return {
    customerId: input.customerId,
    locationId: input.locationId,
    name: input.name.trim(),
    identifier: input.identifier.trim(),
    category: input.category.trim(),
    brand: nullable(input.brand),
    model: nullable(input.model),
    serialNumber: nullable(input.serialNumber),
    notes: nullable(input.notes),
  }
}
