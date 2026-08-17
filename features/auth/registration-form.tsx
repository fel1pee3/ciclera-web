'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api/errors'
import { getCurrentAccount, registerOrganization } from './api'
import { getApiFieldErrors, getAuthErrorMessage } from './errors'
import { roleHome } from './redirects'
import { registrationSchema, type RegistrationInput } from './schemas'

const labels = {
  organizationName: 'Nome da organiza\u00e7\u00e3o',
  ownerName: 'Seu nome',
  email: 'E-mail',
  password: 'Senha',
  confirmPassword: 'Confirmar senha',
  timezone: 'Fuso hor\u00e1rio',
} as const

const timezones = [
  ['America/Sao_Paulo', 'Bras\u00edlia, Sul e Sudeste'],
  ['America/Manaus', 'Amazonas'],
  ['America/Belem', 'Par\u00e1'],
  ['America/Fortaleza', 'Nordeste'],
  ['America/Cuiaba', 'Mato Grosso'],
  ['America/Campo_Grande', 'Mato Grosso do Sul'],
  ['America/Rio_Branco', 'Acre'],
  ['America/Noronha', 'Fernando de Noronha'],
] as const

const registrationFields = [
  ['organizationName', 'organization'] as const,
  ['ownerName', 'name'] as const,
  ['email', 'email'] as const,
  ['password', 'new-password'] as const,
  ['confirmPassword', 'new-password'] as const,
]

export function RegistrationForm() {
  const router = useRouter()
  const [checkingSession, setCheckingSession] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      timezone: 'America/Sao_Paulo',
      termsAccepted: false,
    },
  })

  useEffect(() => {
    let active = true
    void getCurrentAccount()
      .then((account) => {
        if (active) router.replace(roleHome(account.user.role))
      })
      .catch((error: unknown) => {
        if (!active) return
        if (!(error instanceof ApiError) || error.status !== 401) {
          setErrorMessage(
            'N\u00e3o foi poss\u00edvel verificar sua sess\u00e3o. Voc\u00ea ainda pode criar a conta.',
          )
        }
        setCheckingSession(false)
      })
    return () => {
      active = false
    }
  }, [router])

  const onSubmit = async (input: RegistrationInput) => {
    setErrorMessage(null)
    try {
      await registerOrganization(input)
      router.replace('/app')
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

  if (checkingSession) {
    return <p role="status">Verificando sess\u00e3o...</p>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <p className="eyebrow">Comece agora</p>
        <h1 className="mt-3 font-heading text-2xl font-semibold">
          Crie sua conta Ciclera
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você será o proprietário da nova organização e poderá adicionar sua
          equipe depois.
        </p>
      </div>
      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      ) : null}
      {registrationFields.map(([field, autoComplete]) => {
        const isPassword = field === 'password' || field === 'confirmPassword'
        const error = errors[field]
        return (
          <div className="space-y-2" key={field}>
            <Label htmlFor={field}>{labels[field]}</Label>
            <Input
              id={field}
              type={
                isPassword ? 'password' : field === 'email' ? 'email' : 'text'
              }
              autoComplete={autoComplete}
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
      <div className="space-y-2">
        <Label htmlFor="timezone">{labels.timezone}</Label>
        <select
          id="timezone"
          className="input"
          aria-invalid={Boolean(errors.timezone)}
          aria-describedby={errors.timezone ? 'timezone-error' : undefined}
          {...register('timezone')}
        >
          {timezones.map(([value, label]) => (
            <option value={value} key={value}>
              {label} ({value})
            </option>
          ))}
        </select>
        {errors.timezone ? (
          <p id="timezone-error" className="text-sm text-destructive">
            {errors.timezone.message}
          </p>
        ) : null}
      </div>
      <div>
        <div className="flex items-start gap-3">
          <Input
            id="termsAccepted"
            type="checkbox"
            className="mt-1 size-4 min-h-0 w-4 p-0 accent-primary"
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
              className="font-semibold text-primary"
              href="/termos-de-uso"
              target="_blank"
            >
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link
              className="font-semibold text-primary"
              href="/politica-de-privacidade"
              target="_blank"
            >
              Política de Privacidade
            </Link>
            .
          </Label>
        </div>
        {errors.termsAccepted ? (
          <p id="termsAccepted-error" className="mt-1 text-sm text-destructive">
            {errors.termsAccepted.message}
          </p>
        ) : null}
      </div>
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{' '}
        <Link className="font-semibold text-primary" href="/login">
          Entrar
        </Link>
      </p>
    </form>
  )
}
