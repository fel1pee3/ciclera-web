import { z } from 'zod'

export const equipmentArchiveFilterSchema = z.enum([
  'ACTIVE',
  'ARCHIVED',
  'ALL',
])
export type EquipmentArchiveFilter = z.infer<
  typeof equipmentArchiveFilterSchema
>

export const equipmentSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  locationId: z.string().uuid(),
  name: z.string(),
  identifier: z.string(),
  category: z.string(),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  serialNumber: z.string().nullable(),
  notes: z.string().nullable(),
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Equipment = z.infer<typeof equipmentSchema>

export const equipmentPageSchema = z.object({
  items: z.array(equipmentSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type EquipmentPage = z.infer<typeof equipmentPageSchema>
