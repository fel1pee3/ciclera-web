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
import {
  RemoteCustomerSelector,
  RemoteLocationSelector,
} from '@/features/equipment/remote-selectors'
import { createWorkOrder, updateWorkOrder } from './api'
import type { WorkOrderDetails } from './contracts'
import { getWorkOrderErrorMessage } from './errors'
import {
  centsToMoney,
  toLocalDateTime,
  workOrderFormSchema,
  type WorkOrderFormInput,
} from './schemas'
import { RemoteEquipmentSelector } from './selectors'

export function WorkOrderForm({
  workOrder,
  embedded = false,
  onCancel,
  onSaved,
}: {
  workOrder?: WorkOrderDetails
  embedded?: boolean
  onCancel?: () => void
  onSaved: (workOrder: WorkOrderDetails) => void
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkOrderFormInput>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customerId: workOrder?.customerId ?? '',
      locationId: workOrder?.locationId ?? '',
      equipmentId: workOrder?.equipmentId ?? '',
      serviceType: workOrder?.serviceType ?? '',
      title: workOrder?.title ?? '',
      description: workOrder?.description ?? '',
      priority: workOrder?.priority ?? 'NORMAL',
      scheduledStartAt: toLocalDateTime(workOrder?.scheduledStartAt ?? null),
      scheduledEndAt: toLocalDateTime(workOrder?.scheduledEndAt ?? null),
      expectedAmount: centsToMoney(workOrder?.expectedAmountInCents ?? null),
    },
  })
  const [customerId = '', locationId = '', equipmentId = ''] = useWatch({
    control,
    name: ['customerId', 'locationId', 'equipmentId'],
  })

  const submit = async (input: WorkOrderFormInput) => {
    setErrorMessage(null)
    try {
      onSaved(
        workOrder
          ? await updateWorkOrder(workOrder.id, workOrder.version, input)
          : await createWorkOrder(input),
      )
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      for (const field of Object.keys(input) as Array<
        keyof WorkOrderFormInput
      >) {
        const message = fieldErrors?.[field]?.[0]
        if (message) setError(field, { message })
      }
      setErrorMessage(getWorkOrderErrorMessage(error))
    }
  }

  return (
    <form
      className={cn(
        'grid gap-4 sm:grid-cols-2',
        !embedded && 'rounded-2xl border bg-card p-5',
      )}
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      {!embedded ? (
        <h2 className="font-heading text-lg font-semibold sm:col-span-2">
          {workOrder ? 'Editar rascunho' : 'Dados da ordem de serviço'}
        </h2>
      ) : null}
      {errorMessage ? (
        <Alert className="sm:col-span-2" variant="destructive">
          {errorMessage}
        </Alert>
      ) : null}
      <Field label="Cliente" error={errors.customerId?.message}>
        <RemoteCustomerSelector
          value={customerId}
          onChange={(next) => {
            setValue('customerId', next, { shouldValidate: true })
            setValue('locationId', '', { shouldValidate: true })
            setValue('equipmentId', '')
          }}
        />
      </Field>
      <Field label="Local" error={errors.locationId?.message}>
        <RemoteLocationSelector
          customerId={customerId}
          value={locationId}
          onChange={(next) => {
            setValue('locationId', next, { shouldValidate: true })
            setValue('equipmentId', '')
          }}
        />
      </Field>
      <Field label="Equipamento (opcional)" error={errors.equipmentId?.message}>
        <RemoteEquipmentSelector
          customerId={customerId}
          locationId={locationId}
          value={equipmentId}
          onChange={(next) => setValue('equipmentId', next)}
        />
      </Field>
      <Field label="Prioridade" error={errors.priority?.message}>
        <select className="input" {...register('priority')}>
          <option value="LOW">Baixa</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">Alta</option>
          <option value="URGENT">Urgente</option>
        </select>
      </Field>
      <Field label="Tipo de serviço" error={errors.serviceType?.message}>
        <Input {...register('serviceType')} />
      </Field>
      <Field label="Título" error={errors.title?.message}>
        <Input {...register('title')} />
      </Field>
      <Field
        className="sm:col-span-2"
        label="Descrição"
        error={errors.description?.message}
      >
        <Textarea rows={5} {...register('description')} />
      </Field>
      <Field label="Início previsto" error={errors.scheduledStartAt?.message}>
        <Input type="datetime-local" {...register('scheduledStartAt')} />
      </Field>
      <Field label="Término previsto" error={errors.scheduledEndAt?.message}>
        <Input type="datetime-local" {...register('scheduledEndAt')} />
      </Field>
      <Field label="Valor previsto (R$)" error={errors.expectedAmount?.message}>
        <Input
          inputMode="decimal"
          placeholder="0,00"
          {...register('expectedAmount')}
        />
      </Field>
      <div className="flex flex-wrap items-end justify-end gap-3 border-t pt-5 sm:col-span-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Descartar
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar ordem'}
        </Button>
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
    <Label className={`grid content-start gap-2 ${className ?? ''}`}>
      <span>{label}</span>
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </Label>
  )
}
