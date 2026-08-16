import { z } from 'zod'

export const archiveFilterSchema = z.enum(['ACTIVE', 'ARCHIVED', 'ALL'])
export type ArchiveFilter = z.infer<typeof archiveFilterSchema>

export const locationStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export type LocationStatus = z.infer<typeof locationStatusSchema>

export const customerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  document: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  notes: z.string().nullable(),
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type Customer = z.infer<typeof customerSchema>

export const customerPageSchema = z.object({
  items: z.array(customerSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type CustomerPage = z.infer<typeof customerPageSchema>

export const serviceLocationSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  name: z.string(),
  postalCode: z.string(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  contactName: z.string().nullable(),
  contactPhone: z.string().nullable(),
  accessInstructions: z.string().nullable(),
  status: locationStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type ServiceLocation = z.infer<typeof serviceLocationSchema>

export const locationPageSchema = z.object({
  items: z.array(serviceLocationSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type LocationPage = z.infer<typeof locationPageSchema>
