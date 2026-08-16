import { z } from 'zod'

export const userRoleSchema = z.enum(['OWNER', 'ADMIN', 'TECHNICIAN'])
export type UserRole = z.infer<typeof userRoleSchema>

export const authenticatedAccountSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: userRoleSchema,
  }),
  organization: z.object({
    id: z.string().uuid(),
    name: z.string(),
    timezone: z.string(),
  }),
})

export type AuthenticatedAccount = z.infer<typeof authenticatedAccountSchema>

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
})
