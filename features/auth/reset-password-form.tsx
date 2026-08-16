'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from './api'
import { getAuthErrorMessage } from './errors'
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
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

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
          <PasswordField
            id="password"
            label="Nova senha"
            error={errors.password?.message}
            autoComplete="new-password"
            register={register('password')}
          />
          <PasswordField
            id="confirmPassword"
            label="Confirmar nova senha"
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
            register={register('confirmPassword')}
          />
          <Button className="w-full" type="submit" disabled={isSubmitting}>
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

function PasswordField({
  id,
  label,
  error,
  autoComplete,
  register,
}: {
  id: string
  label: string
  error?: string
  autoComplete: string
  register: UseFormRegisterReturn
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="password"
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...register}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
