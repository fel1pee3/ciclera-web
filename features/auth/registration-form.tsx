'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { registerOrganization } from './api'
import { BackToLandingLink } from './back-to-landing-link'
import { getApiFieldErrors, getAuthErrorMessage } from './errors'
import { PasswordRequirements } from './password-requirements'
import { registrationSchema, type RegistrationInput } from './schemas'

const labels = {
  organizationName: 'Nome da organiza\u00e7\u00e3o',
  ownerName: 'Seu nome',
  email: 'E-mail',
  password: 'Senha',
  confirmPassword: 'Confirmar senha',
} as const

const registrationFields = [
  ['organizationName', 'organization'] as const,
  ['ownerName', 'name'] as const,
]

const placeholders = {
  organizationName: 'Ex.: Vértice Serviços Técnicos',
  ownerName: 'Ex.: José da Silva',
} as const

export function RegistrationForm() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      termsAccepted: false,
    },
  })
  const password = useWatch({ control, name: 'password', defaultValue: '' })

  const onSubmit = async (input: RegistrationInput) => {
    setErrorMessage(null)
    try {
      await registerOrganization(input)
      router.replace('/app/assinatura')
      router.refresh()
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of Object.keys(labels) as Array<keyof typeof labels>) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getAuthErrorMessage(error, 'registration'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <BackToLandingLink />
      <div>
        <p className="eyebrow text-xs">Sua operação começa aqui</p>
        <h1 className="mt-3 text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Crie sua conta Ciclera
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Você será o proprietário da organização e poderá convidar sua equipe
          depois.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {registrationFields.map(([field, autoComplete]) => {
          const error = errors[field]
          return (
            <div className="space-y-2.5" key={field}>
              <Label htmlFor={field}>{labels[field]}</Label>
              <Input
                id={field}
                type="text"
                autoComplete={autoComplete}
                placeholder={placeholders[field]}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${field}-error` : undefined}
                {...register(field)}
              />
              {error ? (
                <p id={`${field}-error`} className="text-sm text-destructive">
                  {error.message}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="email">{labels.email}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="voce@empresa.com.br"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="password">{labels.password}</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Crie uma senha segura"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password
              ? 'password-requirements password-error'
              : 'password-requirements'
          }
          {...register('password')}
        />
        <PasswordRequirements value={password} />
        {errors.password ? (
          <p id="password-error" className="text-sm text-destructive">
            A senha ainda não atende a todos os requisitos.
          </p>
        ) : null}
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="confirmPassword">{labels.confirmPassword}</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Digite a senha novamente"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword ? 'confirmPassword-error' : undefined
          }
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p id="confirmPassword-error" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-muted/45 p-4">
        <div className="flex items-start gap-3">
          <Input
            id="termsAccepted"
            type="checkbox"
            className="mt-1 size-4 min-h-0 w-4 shrink-0 p-0 accent-primary"
            aria-invalid={Boolean(errors.termsAccepted)}
            aria-describedby={
              errors.termsAccepted ? 'termsAccepted-error' : undefined
            }
            {...register('termsAccepted')}
          />
          <Label
            htmlFor="termsAccepted"
            className="font-normal leading-relaxed"
          >
            Li e aceito os{' '}
            <Link
              className="font-semibold text-primary hover:underline"
              href="/termos-de-uso"
              target="_blank"
            >
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link
              className="font-semibold text-primary hover:underline"
              href="/politica-de-privacidade"
              target="_blank"
            >
              Política de Privacidade
            </Link>
            .
          </Label>
        </div>
        {errors.termsAccepted ? (
          <p id="termsAccepted-error" className="mt-2 text-sm text-destructive">
            {errors.termsAccepted.message}
          </p>
        ) : null}
      </div>

      <Button
        className="w-full shadow-lg shadow-primary/15"
        size="lg"
        type="submit"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </Button>
      <p className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link
          className="font-semibold text-primary hover:underline"
          href="/login"
        >
          Entrar
        </Link>
      </p>
    </form>
  )
}
