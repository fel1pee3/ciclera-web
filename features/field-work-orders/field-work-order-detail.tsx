'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { WorkOrderStatusBadge } from '@/features/work-orders/status-badge'
import { findFieldWorkOrder } from './api'
import type { FieldWorkOrder } from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'
import { cn } from '@/lib/utils'

export function FieldWorkOrderDetail() {
  const { workOrderId } = useParams<{ workOrderId: string }>()
  const searchParams = useSearchParams()
  const backHref = useMemo(
    () => safeFieldReturn(searchParams.get('from')),
    [searchParams],
  )
  const [order, setOrder] = useState<FieldWorkOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    void findFieldWorkOrder(workOrderId)
      .then((value) => {
        if (active) setOrder(value)
      })
      .catch((reason: unknown) => {
        if (active) setError(getFieldWorkOrderErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [workOrderId])
  if (!order && !error)
    return (
      <Skeleton
        className="h-96 rounded-2xl"
        aria-label="Carregando atendimento"
      />
    )
  return (
    <section className="space-y-5">
      <Link
        className="inline-flex min-h-11 items-center font-semibold text-primary"
        href={backHref}
      >
        ← Voltar
      </Link>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {order ? (
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="eyebrow">{order.number}</p>
              <h1 className="mt-3 break-words font-heading text-2xl font-bold">
                {order.title}
              </h1>
            </div>
            <WorkOrderStatusBadge status={order.status} />
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
            {order.description}
          </p>
          <dl className="mt-5 grid gap-4 text-sm">
            <Data label="Cliente" value={order.customer.name} />
            <Data label="Local" value={order.location.name} />
            <Data label="Endereço" value={address(order.location)} />
            <Data
              label="Equipamento"
              value={
                order.equipment
                  ? `${order.equipment.name} · ${order.equipment.identifier}`
                  : 'Não informado'
              }
            />
            <Data label="Serviço" value={order.serviceType} />
          </dl>
          {order.status === 'SCHEDULED' || order.status === 'IN_PROGRESS' ? (
            <Link
              className={cn(buttonVariants({ size: 'lg' }), 'mt-6 w-full')}
              href={`/field/ordens/${order.id}/executar`}
            >
              {order.status === 'SCHEDULED'
                ? 'Iniciar atendimento'
                : 'Continuar atendimento'}
            </Link>
          ) : null}
        </Card>
      ) : null}
    </section>
  )
}

export function safeFieldReturn(value: string | null) {
  return value?.startsWith('/field/ordens') && !value.startsWith('//')
    ? value
    : '/field/ordens'
}
function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium">{value}</dd>
    </div>
  )
}
function address(location: FieldWorkOrder['location']) {
  return `${location.street}, ${location.number}${location.complement ? `, ${location.complement}` : ''} · ${location.neighborhood}, ${location.city}/${location.state}`
}
