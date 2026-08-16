'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { findCustomer, findLocation } from '@/features/customers/api'
import type { Customer, ServiceLocation } from '@/features/customers/contracts'
import { archiveEquipment, findEquipment } from './api'
import type { Equipment } from './contracts'
import { EquipmentForm } from './equipment-form'
import { getEquipmentErrorMessage } from './errors'

export function EquipmentDetail() {
  const { equipmentId } = useParams<{ equipmentId: string }>()
  const searchParams = useSearchParams()
  const backHref = useMemo(
    () => safeEquipmentReturn(searchParams.get('from')),
    [searchParams],
  )
  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [location, setLocation] = useState<ServiceLocation | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void findEquipment(equipmentId)
      .then(async (nextEquipment) => {
        const [nextCustomer, nextLocation] = await Promise.all([
          findCustomer(nextEquipment.customerId),
          findLocation(nextEquipment.locationId),
        ])
        if (!active) return
        setEquipment(nextEquipment)
        setCustomer(nextCustomer)
        setLocation(nextLocation)
        setError(null)
      })
      .catch((reason: unknown) => {
        if (active) setError(getEquipmentErrorMessage(reason))
      })
    return () => {
      active = false
    }
  }, [equipmentId])

  const archive = async () => {
    if (!equipment || !window.confirm(`Arquivar ${equipment.name}?`)) return
    try {
      setEquipment(await archiveEquipment(equipment.id))
      setNotice(`${equipment.name} foi arquivado.`)
    } catch (reason) {
      setError(getEquipmentErrorMessage(reason))
    }
  }

  if (!equipment && !error) {
    return (
      <Skeleton
        className="mx-auto h-80 max-w-6xl rounded-2xl"
        aria-label="Carregando equipamento"
      />
    )
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Link className="text-sm font-semibold text-primary" href={backHref}>
        ← Voltar para equipamentos
      </Link>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}

      {equipment ? (
        <>
          <header className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">Equipamento</p>
                <h1 className="mt-3 break-words font-heading text-3xl font-bold">
                  {equipment.name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {equipment.identifier} · {equipment.category}
                </p>
              </div>
              <Badge variant={equipment.archivedAt ? 'outline' : 'secondary'}>
                {equipment.archivedAt ? 'Arquivado' : 'Ativo'}
              </Badge>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Data label="Cliente" value={customer?.name ?? 'Carregando…'} />
              <Data label="Local" value={location?.name ?? 'Carregando…'} />
              <Data label="Marca" value={equipment.brand ?? 'Não informada'} />
              <Data label="Modelo" value={equipment.model ?? 'Não informado'} />
              <Data
                label="Serial"
                value={equipment.serialNumber ?? 'Não informado'}
              />
            </dl>
            {equipment.notes ? (
              <p className="mt-4 whitespace-pre-wrap text-sm">
                {equipment.notes}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                Editar
              </Button>
              {!equipment.archivedAt ? (
                <Button variant="ghost" onClick={() => void archive()}>
                  Arquivar
                </Button>
              ) : null}
            </div>
          </header>

          {editing ? (
            <EquipmentForm
              equipment={equipment}
              onCancel={() => setEditing(false)}
              onSaved={(updated) => {
                setEquipment(updated)
                setEditing(false)
                setNotice('Equipamento atualizado.')
                void Promise.all([
                  findCustomer(updated.customerId),
                  findLocation(updated.locationId),
                ]).then(([nextCustomer, nextLocation]) => {
                  setCustomer(nextCustomer)
                  setLocation(nextLocation)
                })
              }}
            />
          ) : null}

          <div>
            <h2 className="font-heading text-2xl font-bold">
              Histórico técnico
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Registros reais das ordens vinculadas aparecerão aqui.
            </p>
          </div>
          <EmptyState
            title="Nenhum atendimento registrado"
            description="O histórico será preenchido somente quando existirem ordens de serviço reais para este equipamento."
          />
        </>
      ) : null}
    </section>
  )
}

export function NewEquipment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const backHref = safeEquipmentReturn(searchParams.get('from'))
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Link className="text-sm font-semibold text-primary" href={backHref}>
        ← Voltar para equipamentos
      </Link>
      <div>
        <p className="eyebrow">Ativos atendidos</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">
          Novo equipamento
        </h1>
      </div>
      <EquipmentForm
        onSaved={(equipment) =>
          router.push(
            `/app/equipamentos/${equipment.id}?from=${encodeURIComponent(backHref)}`,
          )
        }
      />
    </section>
  )
}

export function safeEquipmentReturn(value: string | null): string {
  return value?.startsWith('/app/equipamentos') && !value.startsWith('//')
    ? value
    : '/app/equipamentos'
}

function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
