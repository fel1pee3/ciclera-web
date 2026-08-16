import { z } from 'zod'

import { userRoleSchema } from '@/features/auth/contracts'

export const userStatusSchema = z.enum(['ACTIVE', 'INACTIVE'])
export type UserStatus = z.infer<typeof userStatusSchema>

export const managedUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  status: userStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type ManagedUser = z.infer<typeof managedUserSchema>

export const paginatedUsersSchema = z.object({
  items: z.array(managedUserSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})
export type PaginatedUsers = z.infer<typeof paginatedUsersSchema>
