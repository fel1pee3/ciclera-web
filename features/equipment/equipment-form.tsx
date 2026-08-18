'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiFieldErrors } from '@/features/auth/errors'
import { cn } from '@/lib/utils'
import { createEquipment, updateEquipment } from './api'
import type { Equipment } from './contracts'
import { getEquipmentErrorMessage } from './errors'
import {
  RemoteCustomerSelector,
  RemoteLocationSelector,
} from './remote-selectors'
import { equipmentFormSchema, type EquipmentFormInput } from './schemas'

export function EquipmentForm({
  equipment,
  embedded = false,
  onCancel,
  onSaved,
}: {
  equipment?: Equipment
  embedded?: boolean
  onCancel?: () => void
  onSaved: (equipment: Equipment) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormInput>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      customerId: equipment?.customerId ?? '',
      locationId: equipment?.locationId ?? '',
      name: equipment?.name ?? '',
      identifier: equipment?.identifier ?? '',
      category: equipment?.category ?? '',
      brand: equipment?.brand ?? '',
      model: equipment?.model ?? '',
      serialNumber: equipment?.serialNumber ?? '',
      notes: equipment?.notes ?? '',
    },
  })
  const [customerId = '', locationId = ''] = useWatch({
    control,
    name: ['customerId', 'locationId'],
  })

  const submit = async (input: EquipmentFormInput) => {
    setErrorMessage(null)
    try {
      onSaved(
        equipment
          ? await updateEquipment(equipment.id, input)
          : await createEquipment(input),
      )
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of Object.keys(input) as Array<
        keyof EquipmentFormInput
      >) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getEquipmentErrorMessage(error))
    }
  }

  return (
    <form
      className={cn(
        'space-y-5',
        !embedded && 'rounded-3xl border bg-card p-5 shadow-sm sm:p-6',
      )}
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      {!embedded ? (
        <div>
          <h2 className="font-heading text-xl font-semibold">
            {equipment ? 'Editar equipamento' : 'Dados do equipamento'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Primeiro escolha onde o ativo está instalado; depois informe seus
            dados técnicos.
          </p>
        </div>
      ) : null}
      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      ) : null}

      <section className="rounded-2xl border bg-muted/20 p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Etapa 1
          </p>
          <h3 className="mt-1 font-heading text-lg font-semibold">
            Onde está o equipamento?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha o cliente primeiro. Em seguida, selecione uma unidade desse
            cliente.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Cliente" error={errors.customerId?.message}>
            <RemoteCustomerSelector
              value={customerId}
              onChange={(nextCustomerId) => {
                setValue('customerId', nextCustomerId, {
                  shouldValidate: true,
                })
                setValue(
                  'locationId',
                  dependentLocationValue(
                    customerId,
                    nextCustomerId,
                    locationId,
                  ),
                  { shouldValidate: true },
                )
              }}
            />
          </Field>
          <Field
            label="Local de atendimento"
            error={errors.locationId?.message}
          >
            <RemoteLocationSelector
              customerId={customerId}
              value={locationId}
              onChange={(value) =>
                setValue('locationId', value, { shouldValidate: true })
              }
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border p-4 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            Etapa 2
          </p>
          <h3 className="mt-1 font-heading text-lg font-semibold">
            Identificação técnica
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Use um nome fácil de reconhecer e registre os dados disponíveis na
            etiqueta do equipamento.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do equipamento" error={errors.name?.message}>
            <Input
              placeholder="Ex.: Ar-condicionado da recepção"
              {...register('name')}
            />
          </Field>
          <Field
            label="Identificação interna"
            error={errors.identifier?.message}
          >
            <Input placeholder="Ex.: AR-REC-001" {...register('identifier')} />
          </Field>
          <Field label="Categoria" error={errors.category?.message}>
            <Input
              placeholder="Ex.: Ar-condicionado Split"
              {...register('category')}
            />
          </Field>
          <Field label="Marca" error={errors.brand?.message}>
            <Input placeholder="Ex.: Daikin" {...register('brand')} />
          </Field>
          <Field label="Modelo" error={errors.model?.message}>
            <Input
              placeholder="Ex.: EcoSwing 24.000 BTU"
              {...register('model')}
            />
          </Field>
          <Field label="Número de série" error={errors.serialNumber?.message}>
            <Input
              placeholder="Ex.: DK2408BR2026001842"
              {...register('serialNumber')}
            />
          </Field>
          <Field
            className="sm:col-span-2"
            label="Observações técnicas"
            error={errors.notes?.message}
          >
            <Textarea
              rows={4}
              placeholder="Ex.: Instalado acima do forro. Desligar o disjuntor QD-REC-04 antes de abrir o painel."
              {...register('notes')}
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar equipamento'}
        </Button>
      </div>
    </form>
  )
}

export function dependentLocationValue(
  previousCustomerId: string,
  nextCustomerId: string,
  currentLocationId: string,
): string {
  return previousCustomerId === nextCustomerId ? currentLocationId : ''
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
    <Label className={`grid content-start gap-2 ${className ?? ''}`}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </Label>
  )
}
