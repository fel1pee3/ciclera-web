'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiFieldErrors } from '@/features/auth/errors'
import { cn } from '@/lib/utils'
import { createCustomer, updateCustomer } from './api'
import type { Customer } from './contracts'
import { getCustomerErrorMessage } from './errors'
import {
  formatBrazilPhone,
  formatDocument,
  inferDocumentType,
} from './formatters'
import { MaskedInput } from './masked-input'
import { customerFormSchema, type CustomerFormInput } from './schemas'

export function CustomerForm({
  customer,
  embedded = false,
  onCancel,
  onSaved,
}: {
  customer?: Customer
  embedded?: boolean
  onCancel?: () => void
  onSaved: (customer: Customer) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: customer?.name ?? '',
      documentType: inferDocumentType(customer?.document),
      document: customer?.document
        ? formatDocument(
            customer.document,
            inferDocumentType(customer.document),
          )
        : '',
      email: customer?.email ?? '',
      phone: customer?.phone ? formatBrazilPhone(customer.phone) : '',
      notes: customer?.notes ?? '',
    },
  })
  const documentType = useWatch({ control, name: 'documentType' })
  const documentTypeField = register('documentType')

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
      className={cn(
        !embedded && 'overflow-hidden rounded-3xl border bg-card shadow-sm',
      )}
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      {!embedded ? (
        <div className="border-b px-5 py-5 sm:px-6">
          <h2 className="font-heading text-xl font-semibold">
            {customer ? 'Editar cliente' : 'Dados do cliente'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe os dados de identificação e contato usados na operação.
          </p>
        </div>
      ) : null}

      <div
        className={cn('grid gap-5 sm:grid-cols-2', !embedded && 'p-5 sm:p-6')}
      >
        {errorMessage ? (
          <Alert className="sm:col-span-2" variant="destructive" role="alert">
            {errorMessage}
          </Alert>
        ) : null}
        <FormField
          className="sm:col-span-2"
          label="Nome ou razão social"
          error={errors.name?.message}
        >
          <Input
            autoComplete="organization"
            placeholder="Ex.: Hotel Serra Verde Ltda."
            {...register('name')}
          />
        </FormField>

        <div className="grid gap-2" role="group" aria-label="Documento">
          <div className="flex h-10 items-center justify-between gap-3">
            <p className="text-sm font-medium">Documento</p>
            <div className="flex rounded-lg border bg-muted/35 p-0.5">
              {(['CPF', 'CNPJ'] as const).map((type) => (
                <label key={type} className="cursor-pointer">
                  <input
                    type="radio"
                    value={type}
                    className="peer sr-only"
                    {...documentTypeField}
                    onChange={(event) => {
                      documentTypeField.onChange(event)
                      setValue('document', '', {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }}
                  />
                  <span className="flex min-h-8 items-center rounded-md px-3 text-xs font-semibold text-muted-foreground transition peer-checked:bg-background peer-checked:text-primary peer-checked:shadow-sm">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <Controller
            control={control}
            name="document"
            render={({ field }) => (
              <MaskedInput
                name={field.name}
                value={field.value}
                inputRef={field.ref}
                onBlur={field.onBlur}
                onValueChange={field.onChange}
                format={(value) => formatDocument(value, documentType)}
                inputMode="numeric"
                maxLength={documentType === 'CPF' ? 14 : 18}
                aria-label={`Número do ${documentType}`}
                placeholder={
                  documentType === 'CPF'
                    ? '000.000.000-00'
                    : '00.000.000/0000-00'
                }
                aria-invalid={Boolean(errors.document)}
              />
            )}
          />
          {errors.document ? (
            <span className="text-sm text-destructive">
              {errors.document.message}
            </span>
          ) : null}
        </div>

        <div className="grid gap-2">
          <div className="flex h-10 items-center">
            <p className="text-sm font-medium">Telefone</p>
          </div>
          <Controller
            control={control}
            name="phone"
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
                aria-label="Telefone"
                placeholder="+55 (85) 93344-9080"
                aria-invalid={Boolean(errors.phone)}
              />
            )}
          />
          {errors.phone ? (
            <span className="text-sm text-destructive">
              {errors.phone.message}
            </span>
          ) : null}
        </div>

        <FormField
          className="sm:col-span-2"
          label="E-mail"
          error={errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="contato@empresa.com.br"
            {...register('email')}
          />
        </FormField>
        <FormField
          className="sm:col-span-2"
          label="Observações operacionais"
          error={errors.notes?.message}
        >
          <Textarea
            rows={5}
            placeholder="Ex.: Agendar atendimentos com a recepção e solicitar acesso à área técnica."
            {...register('notes')}
          />
        </FormField>
      </div>

      <div
        className={cn(
          'flex flex-wrap justify-end gap-3 border-t',
          embedded ? 'mt-5 pt-5' : 'bg-muted/20 px-5 py-4 sm:px-6',
        )}
      >
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar cliente'}
        </Button>
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
