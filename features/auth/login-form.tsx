'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from './api'
import { getApiFieldErrors, getAuthErrorMessage } from './errors'
import { safeReturnPath } from './redirects'
import { loginSchema, type LoginInput } from './schemas'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (input: LoginInput) => {
    setErrorMessage(null)
    try {
      const account = await login(input)
      router.replace(
        safeReturnPath(searchParams.get('returnTo'), account.user.role),
      )
      router.refresh()
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of ['email', 'password'] as const) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getAuthErrorMessage(error, 'login'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <p className="eyebrow">Acesso seguro</p>
        <h1 className="mt-3 font-heading text-2xl font-semibold">
          Entrar na Ciclera
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use o e-mail cadastrado pela sua empresa.
        </p>
      </div>
      {errorMessage && (
        <Alert variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          autoComplete="email"
          type="email"
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
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          autoComplete="current-password"
          type="password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Entrar'}
      </Button>
      <Link
        className="block text-center text-sm font-semibold text-primary"
        href="/recuperar-senha"
      >
        Esqueci minha senha
      </Link>
      <p className="text-center text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Link className="font-semibold text-primary" href="/registro">
          Criar conta
        </Link>
      </p>
    </form>
  )
}
