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
  onCancel,
  onSaved,
}: {
  equipment?: Equipment
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
      className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <div className="sm:col-span-2">
        <h2 className="font-heading text-lg font-semibold">
          {equipment ? 'Editar equipamento' : 'Dados do equipamento'}
        </h2>
      </div>
      {errorMessage ? (
        <Alert className="sm:col-span-2" variant="destructive" role="alert">
          {errorMessage}
        </Alert>
      ) : null}
      <Field label="Cliente" error={errors.customerId?.message}>
        <RemoteCustomerSelector
          value={customerId}
          onChange={(nextCustomerId) => {
            setValue('customerId', nextCustomerId, { shouldValidate: true })
            setValue(
              'locationId',
              dependentLocationValue(customerId, nextCustomerId, locationId),
              { shouldValidate: true },
            )
          }}
        />
      </Field>
      <Field label="Local" error={errors.locationId?.message}>
        <RemoteLocationSelector
          customerId={customerId}
          value={locationId}
          onChange={(value) =>
            setValue('locationId', value, { shouldValidate: true })
          }
        />
      </Field>
      <Field label="Nome" error={errors.name?.message}>
        <Input {...register('name')} />
      </Field>
      <Field label="Identificação" error={errors.identifier?.message}>
        <Input {...register('identifier')} />
      </Field>
      <Field label="Categoria" error={errors.category?.message}>
        <Input {...register('category')} />
      </Field>
      <Field label="Marca" error={errors.brand?.message}>
        <Input {...register('brand')} />
      </Field>
      <Field label="Modelo" error={errors.model?.message}>
        <Input {...register('model')} />
      </Field>
      <Field label="Serial" error={errors.serialNumber?.message}>
        <Input {...register('serialNumber')} />
      </Field>
      <Field
        className="sm:col-span-2"
        label="Observações técnicas"
        error={errors.notes?.message}
      >
        <Textarea rows={4} {...register('notes')} />
      </Field>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar equipamento'}
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
