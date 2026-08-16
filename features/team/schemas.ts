import { z } from 'zod'

import { userRoleSchema } from '@/features/auth/contracts'

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe ao menos 2 caracteres.')
    .max(160, 'Use no máximo 160 caracteres.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Informe um e-mail válido.')
    .max(320),
  password: z
    .string()
    .min(8, 'Use ao menos 8 caracteres.')
    .max(128, 'Use no máximo 128 caracteres.'),
  role: userRoleSchema,
})
export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe ao menos 2 caracteres.')
    .max(160, 'Use no máximo 160 caracteres.'),
  role: userRoleSchema,
})
export type UpdateUserInput = z.infer<typeof updateUserSchema>
