import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Informe um e-mail válido.')
    .max(320, 'O e-mail deve ter no máximo 320 caracteres.'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .max(128, 'A senha deve ter no máximo 128 caracteres.'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Informe um e-mail válido.')
    .max(320, 'O e-mail deve ter no máximo 320 caracteres.'),
})

export const currentLegalVersion = '2026-08-17'

export const securePasswordRules = [
  {
    id: 'length',
    label: 'Pelo menos 10 caracteres',
    test: (value: string) => value.length >= 10,
  },
  {
    id: 'uppercase',
    label: 'Uma letra maiúscula',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'Uma letra minúscula',
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'Um número',
    test: (value: string) => /\d/.test(value),
  },
  {
    id: 'symbol',
    label: 'Um símbolo, como !, @ ou #',
    test: (value: string) => /[^A-Za-z0-9\s]/.test(value),
  },
] as const

export const securePasswordSchema = z
  .string()
  .max(128, 'A senha deve ter no máximo 128 caracteres.')
  .superRefine((value, context) => {
    for (const rule of securePasswordRules) {
      if (!rule.test(value)) {
        context.addIssue({
          code: 'custom',
          message: `A senha precisa ter ${rule.label.toLowerCase()}.`,
        })
      }
    }
  })

export const resetPasswordSchema = z
  .object({
    password: securePasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'As senhas precisam ser iguais.',
    path: ['confirmPassword'],
  })

export const registrationSchema = z
  .object({
    organizationName: z
      .string()
      .trim()
      .min(
        2,
        'O nome da organiza\u00e7\u00e3o deve ter pelo menos 2 caracteres.',
      )
      .max(
        160,
        'O nome da organiza\u00e7\u00e3o deve ter no m\u00e1ximo 160 caracteres.',
      ),
    ownerName: z
      .string()
      .trim()
      .min(2, 'Seu nome deve ter pelo menos 2 caracteres.')
      .max(160, 'Seu nome deve ter no m\u00e1ximo 160 caracteres.'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Informe um e-mail v\u00e1lido.')
      .max(320, 'O e-mail deve ter no m\u00e1ximo 320 caracteres.'),
    password: securePasswordSchema,
    confirmPassword: z.string(),
    termsAccepted: z.boolean().refine((value) => value, {
      message: 'Aceite os Termos de Uso e a Pol\u00edtica de Privacidade.',
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'As senhas precisam ser iguais.',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
