'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { resetPassword } from './api'
import { getAuthErrorMessage } from './errors'
import { PasswordRequirements } from './password-requirements'
import { resetPasswordSchema, type ResetPasswordInput } from './schemas'

const resetTokenPattern = /^[A-Za-z0-9_-]{43}$/

export function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null)
  const [tokenLoaded, setTokenLoaded] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })
  const password = useWatch({ control, name: 'password', defaultValue: '' })

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const candidate = new URLSearchParams(window.location.hash.slice(1)).get(
        'token',
      )
      setToken(
        candidate && resetTokenPattern.test(candidate) ? candidate : null,
      )
      setTokenLoaded(true)
      if (window.location.hash)
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}`,
        )
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const onSubmit = async (input: ResetPasswordInput) => {
    if (!token) return
    setFeedback(null)
    try {
      await resetPassword(token, input.password)
      setToken(null)
      reset()
      setFeedback({
        type: 'success',
        message: 'Senha redefinida. Você já pode entrar novamente.',
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getAuthErrorMessage(error, 'reset-password'),
      })
    }
  }

  if (!tokenLoaded)
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Validando o link…
      </p>
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <p className="eyebrow">Nova credencial</p>
        <h1 className="mt-3 font-heading text-2xl font-semibold">
          Redefinir senha
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Escolha uma senha forte e diferente das que você já utilizou.
        </p>
      </div>
      {!token && !feedback && (
        <Alert variant="destructive" role="alert">
          Este link é inválido ou não contém um token de redefinição.
        </Alert>
      )}
      {feedback && (
        <Alert
          variant={feedback.type === 'success' ? 'success' : 'destructive'}
          role="status"
        >
          {feedback.message}
        </Alert>
      )}
      {token && (
        <>
          <div className="space-y-2.5">
            <Label htmlFor="password">Nova senha</Label>
            <PasswordInput
              id="password"
              placeholder="Crie uma senha segura"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password
                  ? 'password-requirements password-error'
                  : 'password-requirements'
              }
              {...register('password')}
            />
            <PasswordRequirements value={password} />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Digite a nova senha novamente"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? 'confirmPassword-error' : undefined
              }
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-sm text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? 'Redefinindo…' : 'Redefinir senha'}
          </Button>
        </>
      )}
      <Link
        className="block text-center text-sm font-semibold text-primary"
        href="/login"
      >
        Ir para o login
      </Link>
    </form>
  )
}
