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

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .max(128, 'A senha deve ter no máximo 128 caracteres.'),
  confirmPassword: z.string(),
})

export const currentLegalVersion = '2026-08-17'

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
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .max(128, 'A senha deve ter no m\u00e1ximo 128 caracteres.'),
    confirmPassword: z.string(),
    timezone: z
      .string()
      .min(1, 'Selecione o fuso hor\u00e1rio.')
      .refine(
        isIanaTimezone,
        'Selecione um fuso hor\u00e1rio IANA v\u00e1lido.',
      ),
    termsAccepted: z.boolean().refine((value) => value, {
      message: 'Aceite os Termos de Uso e a Pol\u00edtica de Privacidade.',
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'As senhas precisam ser iguais.',
    path: ['confirmPassword'],
  })

function isIanaTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type RegistrationInput = z.infer<typeof registrationSchema>
