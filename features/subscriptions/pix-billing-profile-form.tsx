'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  formatBrazilPhone,
  formatDocument,
  formatPostalCode,
  onlyDigits,
} from '@/features/customers/formatters'
import { MaskedInput } from '@/features/customers/masked-input'
import type { PixBillingProfile } from './api'

const pixBillingProfileSchema = z
  .object({
    documentType: z.enum(['CPF', 'CNPJ']),
    cpfCnpj: z.string(),
    mobilePhone: z
      .string()
      .refine(
        (value) => /^55\d{10,11}$/.test(onlyDigits(value)),
        'Informe DDD e telefone completos.',
      ),
    postalCode: z
      .string()
      .refine(
        (value) => onlyDigits(value).length === 8,
        'Informe um CEP com 8 dígitos.',
      ),
    address: z.string().trim().min(2, 'Informe o logradouro.').max(160),
    addressNumber: z.string().trim().min(1, 'Informe o número.').max(20),
    complement: z.string().trim().max(80),
    province: z.string().trim().min(2, 'Informe o bairro.').max(80),
  })
  .superRefine((input, context) => {
    const expected = input.documentType === 'CPF' ? 11 : 14
    if (onlyDigits(input.cpfCnpj).length !== expected) {
      context.addIssue({
        code: 'custom',
        path: ['cpfCnpj'],
        message: `Informe um ${input.documentType} com ${expected} dígitos.`,
      })
    }
  })

type PixBillingProfileFormInput = z.infer<typeof pixBillingProfileSchema>

export function PixBillingProfileForm({
  onBack,
  onSubmit,
  pending,
}: {
  onBack: () => void
  onSubmit: (profile: PixBillingProfile) => Promise<void>
  pending: boolean
}) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
  } = useForm<PixBillingProfileFormInput>({
    resolver: zodResolver(pixBillingProfileSchema),
    defaultValues: {
      documentType: 'CPF',
      cpfCnpj: '',
      mobilePhone: '+55',
      postalCode: '',
      address: '',
      addressNumber: '',
      complement: '',
      province: '',
    },
  })
  const documentType = useWatch({ control, name: 'documentType' })

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={handleSubmit(async (input) => {
        await onSubmit({
          cpfCnpj: onlyDigits(input.cpfCnpj),
          mobilePhone: onlyDigits(input.mobilePhone),
          postalCode: onlyDigits(input.postalCode),
          address: input.address.trim(),
          addressNumber: input.addressNumber.trim(),
          complement: input.complement.trim() || undefined,
          province: input.province.trim(),
        })
      })}
    >
      <Alert>
        <span className="flex items-start gap-3">
          <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            Estes dados são enviados diretamente ao Asaas para criar a cobrança
            Pix e não ficam armazenados na Ciclera.
          </span>
        </span>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">CPF ou CNPJ</span>
            <div className="flex rounded-lg border bg-muted/35 p-0.5">
              {(['CPF', 'CNPJ'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`min-h-8 rounded-md px-3 text-xs font-semibold transition ${
                    documentType === type
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => {
                    setValue('documentType', type)
                    setValue('cpfCnpj', '', {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <Controller
            control={control}
            name="cpfCnpj"
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
                placeholder={
                  documentType === 'CPF'
                    ? '000.000.000-00'
                    : '00.000.000/0000-00'
                }
                aria-invalid={Boolean(errors.cpfCnpj)}
              />
            )}
          />
          <FieldError>{errors.cpfCnpj?.message}</FieldError>
        </div>

        <Field label="Celular" error={errors.mobilePhone?.message}>
          <Controller
            control={control}
            name="mobilePhone"
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
                aria-invalid={Boolean(errors.mobilePhone)}
              />
            )}
          />
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

        <Field label="Logradouro" error={errors.address?.message}>
          <Input
            autoComplete="street-address"
            placeholder="Ex.: Avenida Paulista"
            {...register('address')}
          />
        </Field>
        <Field label="Número" error={errors.addressNumber?.message}>
          <Input placeholder="Ex.: 1578" {...register('addressNumber')} />
        </Field>
        <Field label="Complemento" error={errors.complement?.message}>
          <Input placeholder="Ex.: Sala 12" {...register('complement')} />
        </Field>
        <Field label="Bairro" error={errors.province?.message}>
          <Input placeholder="Ex.: Bela Vista" {...register('province')} />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={onBack}
        >
          <ArrowLeft aria-hidden="true" /> Voltar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Gerando cobrança…' : 'Gerar cobrança Pix'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode
  error?: string
  label: string
}) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      {children}
      <FieldError>{error}</FieldError>
    </Label>
  )
}

function FieldError({ children }: { children?: string }) {
  return children ? (
    <span className="text-sm text-destructive">{children}</span>
  ) : null
}
