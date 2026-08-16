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
import { createCustomer, updateCustomer } from './api'
import type { Customer } from './contracts'
import { getCustomerErrorMessage } from './errors'
import { customerFormSchema, type CustomerFormInput } from './schemas'

export function CustomerForm({
  customer,
  onCancel,
  onSaved,
}: {
  customer?: Customer
  onCancel?: () => void
  onSaved: (customer: Customer) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? '',
      document: customer?.document ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      notes: customer?.notes ?? '',
    },
  })

  const submit = async (input: CustomerFormInput) => {
    setErrorMessage(null)
    try {
      onSaved(
        customer
          ? await updateCustomer(customer.id, input)
          : await createCustomer(input),
      )
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of [
        'name',
        'document',
        'email',
        'phone',
        'notes',
      ] as const) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getCustomerErrorMessage(error))
    }
  }

  return (
    <form
      className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <div className="sm:col-span-2">
        <h2 className="font-heading text-lg font-semibold">
          {customer ? 'Editar cliente' : 'Dados do cliente'}
        </h2>
      </div>
      {errorMessage ? (
        <Alert className="sm:col-span-2" variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      ) : null}
      <FormField label="Nome ou razão social" error={errors.name?.message}>
        <Input autoComplete="organization" {...register('name')} />
      </FormField>
      <FormField label="Documento" error={errors.document?.message}>
        <Input inputMode="numeric" {...register('document')} />
      </FormField>
      <FormField label="E-mail" error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </FormField>
      <FormField label="Telefone" error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" {...register('phone')} />
      </FormField>
      <FormField
        className="sm:col-span-2"
        label="Observações operacionais"
        error={errors.notes?.message}
      >
        <Textarea rows={4} {...register('notes')} />
      </FormField>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar cliente'}
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

function FormField({
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
