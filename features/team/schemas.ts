import { z } from 'zod'

import { userRoleSchema } from '@/features/auth/contracts'
import { securePasswordSchema } from '@/features/auth/schemas'

export const createUserSchema = z
  .object({
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
    password: securePasswordSchema,
    confirmPassword: z.string(),
    role: userRoleSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'As senhas precisam ser iguais.',
    path: ['confirmPassword'],
  })
export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z
  .object({
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
    password: z.union([z.literal(''), securePasswordSchema]),
    confirmPassword: z.string(),
    role: userRoleSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'As senhas precisam ser iguais.',
    path: ['confirmPassword'],
  })
export type UpdateUserInput = z.infer<typeof updateUserSchema>
