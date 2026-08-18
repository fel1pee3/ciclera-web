'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiFieldErrors } from '@/features/auth/errors'
import { cn } from '@/lib/utils'
import { createLocation, updateLocation } from './api'
import type { ServiceLocation } from './contracts'
import { getCustomerErrorMessage } from './errors'
import { formatBrazilPhone, formatPostalCode } from './formatters'
import { MaskedInput } from './masked-input'
import { locationFormSchema, type LocationFormInput } from './schemas'

const fields = [
  'name',
  'postalCode',
  'street',
  'number',
  'complement',
  'neighborhood',
  'city',
  'state',
  'country',
  'contactName',
  'contactPhone',
  'accessInstructions',
  'status',
] as const

export function LocationForm({
  customerId,
  embedded = false,
  location,
  onCancel,
  onSaved,
}: {
  customerId: string
  embedded?: boolean
  location?: ServiceLocation
  onCancel?: () => void
  onSaved: (location: ServiceLocation) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormInput>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: location?.name ?? '',
      postalCode: formatPostalCode(location?.postalCode ?? ''),
      street: location?.street ?? '',
      number: location?.number ?? '',
      complement: location?.complement ?? '',
      neighborhood: location?.neighborhood ?? '',
      city: location?.city ?? '',
      state: location?.state ?? '',
      country: location?.country ?? 'BR',
      contactName: location?.contactName ?? '',
      contactPhone: formatBrazilPhone(location?.contactPhone ?? ''),
      accessInstructions: location?.accessInstructions ?? '',
      status: location?.status ?? 'ACTIVE',
    },
  })

  const submit = async (input: LocationFormInput) => {
    setErrorMessage(null)
    try {
      onSaved(
        location
          ? await updateLocation(location.id, input)
          : await createLocation(customerId, input),
      )
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of fields) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getCustomerErrorMessage(error))
    }
  }

  return (
    <form
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
        !embedded && 'rounded-2xl border bg-card p-5',
      )}
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      {!embedded ? (
        <h3 className="font-heading text-lg font-semibold sm:col-span-2 lg:col-span-3">
          {location ? 'Editar local' : 'Adicionar local'}
        </h3>
      ) : null}
      {errorMessage ? (
        <Alert
          className="sm:col-span-2 lg:col-span-3"
          variant="destructive"
          role="alert"
        >
          {errorMessage}
        </Alert>
      ) : null}
      <Field label="Nome da unidade" error={errors.name?.message}>
        <Input placeholder="Ex.: Unidade Centro" {...register('name')} />
      </Field>
      <Field label="CEP" error={errors.postalCode?.message}>
        <Controller
          control={control}
          name="postalCode"
          render={({ field }) => (
            <MaskedInput
              name={field.name}
              value={field.value}
              inputRef={field.ref}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              format={formatPostalCode}
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
              aria-invalid={Boolean(errors.postalCode)}
            />
          )}
        />
      </Field>
      <Field label="Logradouro" error={errors.street?.message}>
        <Input placeholder="Ex.: Avenida Paulista" {...register('street')} />
      </Field>
      <Field label="Número" error={errors.number?.message}>
        <Input placeholder="Ex.: 1578" {...register('number')} />
      </Field>
      <Field label="Complemento" error={errors.complement?.message}>
        <Input
          placeholder="Ex.: Bloco A, sala 12"
          {...register('complement')}
        />
      </Field>
      <Field label="Bairro" error={errors.neighborhood?.message}>
        <Input placeholder="Ex.: Bela Vista" {...register('neighborhood')} />
      </Field>
      <Field label="Cidade" error={errors.city?.message}>
        <Input placeholder="Ex.: São Paulo" {...register('city')} />
      </Field>
      <Field label="UF" error={errors.state?.message}>
        <Input maxLength={2} placeholder="SP" {...register('state')} />
      </Field>
      <Field label="País" error={errors.country?.message}>
        <Input maxLength={2} placeholder="BR" {...register('country')} />
      </Field>
      <Field label="Contato local" error={errors.contactName?.message}>
        <Input placeholder="Nome do responsável" {...register('contactName')} />
      </Field>
      <Field label="Telefone do local" error={errors.contactPhone?.message}>
        <Controller
          control={control}
          name="contactPhone"
          render={({ field }) => (
            <MaskedInput
              name={field.name}
              value={field.value}
              inputRef={field.ref}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              format={formatBrazilPhone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={19}
              placeholder="+55 (85) 93344-9080"
              aria-invalid={Boolean(errors.contactPhone)}
            />
          )}
        />
      </Field>
      <Field label="Status" error={errors.status?.message}>
        <select className="input" {...register('status')}>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
        </select>
      </Field>
      <Field
        className="sm:col-span-2 lg:col-span-3"
        label="Instruções de acesso"
        error={errors.accessInstructions?.message}
      >
        <Textarea
          rows={3}
          placeholder="Ex.: Apresentar documento na recepção e solicitar acesso à área técnica."
          {...register('accessInstructions')}
        />
      </Field>
      <div className="flex flex-wrap justify-end gap-3 border-t pt-4 sm:col-span-2 lg:col-span-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar local'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}

function Field({
  children,
  className,
  error,
  label,
}: {
  children: React.ReactNode
  className?: string
  error?: string
  label: string
}) {
  return (
    <Label className={`grid gap-2 ${className ?? ''}`}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </Label>
  )
}
