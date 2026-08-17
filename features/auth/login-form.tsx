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
import { PasswordInput } from '@/components/ui/password-input'
import { login } from './api'
import { BackToLandingLink } from './back-to-landing-link'
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <BackToLandingLink />
      <div>
        <p className="eyebrow text-xs">Bem-vindo de volta</p>
        <h1 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Entre na sua conta
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Acesse sua operação com o e-mail cadastrado na Ciclera.
        </p>
      </div>
      {errorMessage && (
        <Alert variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      )}
      <div className="space-y-2.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          autoComplete="email"
          type="email"
          placeholder="voce@empresa.com.br"
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
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="password">Senha</Label>
          <Link
            className="text-xs font-semibold text-primary hover:underline"
            href="/recuperar-senha"
          >
            Esqueci minha senha
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Digite sua senha"
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
      <Button
        className="w-full shadow-lg shadow-primary/15"
        size="lg"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Entrando…' : 'Entrar'}
      </Button>
      <p className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Não tem uma conta?{' '}
        <Link
          className="font-semibold text-primary hover:underline"
          href="/registro"
        >
          Criar conta
        </Link>
      </p>
    </form>
  )
}
