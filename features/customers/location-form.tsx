'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiFieldErrors } from '@/features/auth/errors'
import { createLocation, updateLocation } from './api'
import type { ServiceLocation } from './contracts'
import { getCustomerErrorMessage } from './errors'
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
  location,
  onCancel,
  onSaved,
}: {
  customerId: string
  location?: ServiceLocation
  onCancel?: () => void
  onSaved: (location: ServiceLocation) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormInput>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: location?.name ?? '',
      postalCode: location?.postalCode ?? '',
      street: location?.street ?? '',
      number: location?.number ?? '',
      complement: location?.complement ?? '',
      neighborhood: location?.neighborhood ?? '',
      city: location?.city ?? '',
      state: location?.state ?? '',
      country: location?.country ?? 'BR',
      contactName: location?.contactName ?? '',
      contactPhone: location?.contactPhone ?? '',
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
      className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <h3 className="font-heading text-lg font-semibold sm:col-span-2 lg:col-span-3">
        {location ? 'Editar local' : 'Adicionar local'}
      </h3>
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
        <Input {...register('name')} />
      </Field>
      <Field label="CEP" error={errors.postalCode?.message}>
        <Input {...register('postalCode')} />
      </Field>
      <Field label="Logradouro" error={errors.street?.message}>
        <Input {...register('street')} />
      </Field>
      <Field label="Número" error={errors.number?.message}>
        <Input {...register('number')} />
      </Field>
      <Field label="Complemento" error={errors.complement?.message}>
        <Input {...register('complement')} />
      </Field>
      <Field label="Bairro" error={errors.neighborhood?.message}>
        <Input {...register('neighborhood')} />
      </Field>
      <Field label="Cidade" error={errors.city?.message}>
        <Input {...register('city')} />
      </Field>
      <Field label="UF" error={errors.state?.message}>
        <Input maxLength={2} {...register('state')} />
      </Field>
      <Field label="País" error={errors.country?.message}>
        <Input maxLength={2} {...register('country')} />
      </Field>
      <Field label="Contato local" error={errors.contactName?.message}>
        <Input {...register('contactName')} />
      </Field>
      <Field label="Telefone do local" error={errors.contactPhone?.message}>
        <Input type="tel" {...register('contactPhone')} />
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
        <Textarea rows={3} {...register('accessInstructions')} />
      </Field>
      <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">
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
