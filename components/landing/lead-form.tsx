'use client'

import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormRegister } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { leadSchema, type LeadInput } from '@/lib/lead-schema'

const fields = [
  ['name', 'Nome completo', 'text'],
  ['company', 'Empresa', 'text'],
  ['role', 'Cargo ou função', 'text'],
  ['email', 'E-mail corporativo', 'email'],
  ['whatsapp', 'WhatsApp', 'tel'],
  ['location', 'Cidade e estado', 'text'],
] as const

const technicians = ['1–4', '5–10', '11–20', '21–30', 'Mais de 30']
const orders = ['Até 50', '51–100', '101–300', '301–500', 'Mais de 500']
const controls = [
  'WhatsApp',
  'Papel',
  'Planilhas',
  'ERP genérico',
  'Software de ordem de serviço',
  'Combinação de ferramentas',
]

export function LeadForm() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { consent: false, website: '' },
  })

  const onSubmit = async (data: LeadInput) => {
    setStatus('idle')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error()

      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contato" className="section bg-card">
      <div className="container-page grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <p className="eyebrow">Fale com a equipe</p>
          <h2 className="section-title">
            Vamos entender o caminho entre sua operação e o faturamento.
          </h2>
          <p className="section-copy">
            Conte um pouco sobre sua equipe. Usaremos essas informações para
            entender sua operação e responder ao contato.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="rounded-2xl border border-border bg-background p-5 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map(([name, label, type]) => {
              const error = errors[name]?.message

              return (
                <Field key={name} id={name} label={label} error={error}>
                  <Input
                    {...register(name)}
                    id={name}
                    type={type}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${name}-error` : undefined}
                  />
                </Field>
              )
            })}

            <SelectField
              label="Quantidade de técnicos"
              name="technicians"
              options={technicians}
              register={register}
              error={errors.technicians?.message}
            />
            <SelectField
              label="OS aproximadas por mês"
              name="monthlyOrders"
              options={orders}
              register={register}
              error={errors.monthlyOrders?.message}
            />
            <SelectField
              label="Controle atual"
              name="currentControl"
              options={controls}
              register={register}
              error={errors.currentControl?.message}
              wide
            />
            <Field
              id="challenge"
              label="Principal dificuldade entre execução e faturamento"
              error={errors.challenge?.message}
              wide
            >
              <Textarea
                {...register('challenge')}
                id="challenge"
                rows={4}
                aria-invalid={Boolean(errors.challenge)}
                aria-describedby={
                  errors.challenge ? 'challenge-error' : undefined
                }
                className="resize-none"
              />
            </Field>

            <div className="hidden" aria-hidden="true">
              <Label htmlFor="website">Website</Label>
              <Input
                {...register('website')}
                id="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-start gap-3">
                <Input
                  {...register('consent')}
                  id="consent"
                  type="checkbox"
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={
                    errors.consent ? 'consent-error' : undefined
                  }
                  className="mt-1 size-4 min-h-0 w-4 p-0 accent-primary"
                />
                <Label htmlFor="consent" className="font-normal">
                  Concordo em receber contato da equipe Ciclera sobre a
                  plataforma.
                </Label>
              </div>
              {errors.consent && (
                <p id="consent-error" className="mt-1 text-sm text-destructive">
                  {errors.consent.message}
                </p>
              )}
            </div>

            <Button
              disabled={isSubmitting}
              className="sm:col-span-2"
              size="lg"
              type="submit"
            >
              {isSubmitting ? 'Enviando informações...' : 'Falar com a equipe'}
            </Button>

            {status === 'success' && (
              <Alert
                role="status"
                variant="success"
                className="font-semibold sm:col-span-2"
              >
                Recebemos seus dados. Entraremos em contato para entender melhor
                sua operação.
              </Alert>
            )}
            {status === 'error' && (
              <Alert
                role="alert"
                variant="destructive"
                className="sm:col-span-2"
              >
                Não foi possível enviar agora. Seus dados não foram confirmados;
                tente novamente mais tarde.
              </Alert>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  error,
  wide,
  children,
}: {
  id: string
  label: string
  error?: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

function SelectField({
  label,
  name,
  options,
  register,
  error,
  wide,
}: {
  label: string
  name: 'technicians' | 'monthlyOrders' | 'currentControl'
  options: readonly string[]
  register: UseFormRegister<LeadInput>
  error?: string
  wide?: boolean
}) {
  return (
    <Field id={name} label={label} error={error} wide={wide}>
      <select
        {...register(name)}
        id={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="input"
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  )
}
