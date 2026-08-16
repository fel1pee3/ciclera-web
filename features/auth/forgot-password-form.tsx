'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from './api'
import { getAuthErrorMessage } from './errors'
import { forgotPasswordSchema, type ForgotPasswordInput } from './schemas'

export function ForgotPasswordForm() {
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (input: ForgotPasswordInput) => {
    setFeedback(null)
    try {
      setFeedback({
        type: 'success',
        message: await requestPasswordReset(input),
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getAuthErrorMessage(error, 'forgot-password'),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <p className="eyebrow">Recuperação de acesso</p>
        <h1 className="mt-3 font-heading text-2xl font-semibold">
          Recuperar senha
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe seu e-mail para receber as instruções disponíveis.
        </p>
      </div>
      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'success' : 'destructive'}
          role="status"
        >
          {feedback.message}
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando…' : 'Enviar instruções'}
      </Button>
      <Link
        className="block text-center text-sm font-semibold text-primary"
        href="/login"
      >
        Voltar para o login
      </Link>
    </form>
  )
}
