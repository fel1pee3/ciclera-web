'use client'

import { Check, CircleOff, LoaderCircle, Search, Wrench, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listEquipment } from '@/features/equipment/api'
import type { Equipment, EquipmentPage } from '@/features/equipment/contracts'

interface SelectedEquipment {
  id: string
  title: string
  description: string
}

export function RemoteEquipmentSelector({
  customerId,
  locationId,
  value,
  onChange,
}: {
  customerId: string
  locationId: string
  value: string
  onChange: (equipmentId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [result, setResult] = useState<EquipmentPage | null>(null)
  const [selected, setSelected] = useState<SelectedEquipment | null>(null)
  const [choosing, setChoosing] = useState(!value)
  const [withoutEquipment, setWithoutEquipment] = useState(false)
  const [loading, setLoading] = useState(Boolean(locationId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!customerId || !locationId) return
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      void listEquipment({
        page: 1,
        pageSize: 50,
        archive: 'ACTIVE',
        customerId,
        locationId,
        ...(search.trim() ? { search: search.trim() } : {}),
      })
        .then((next) => {
          if (!active) return
          setResult(next)
          setError(null)
          const current = next.items.find((item) => item.id === value)
          if (current) setSelected(equipmentOption(current))
        })
        .catch(() => {
          if (active) {
            setResult(null)
            setError('Não foi possível carregar os equipamentos.')
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 250)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [customerId, locationId, search, value])

  if (!locationId) {
    return (
      <div className="flex min-h-24 items-center gap-3 rounded-xl border border-dashed bg-card/60 px-4 py-3 text-muted-foreground">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
          <Wrench aria-hidden="true" className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Aguardando o local
          </p>
          <p className="mt-0.5 text-xs leading-relaxed">
            Escolha um local para visualizar os equipamentos instalados.
          </p>
        </div>
      </div>
    )
  }

  if (value && !choosing) {
    return (
      <EquipmentChoice
        icon={<Wrench aria-hidden="true" className="size-5" />}
        label="Equipamento selecionado"
        title={selected?.title ?? 'Equipamento selecionado'}
        description={
          selected?.description ?? 'Ativo vinculado à ordem de serviço'
        }
        onChange={() => setChoosing(true)}
      />
    )
  }

  if (withoutEquipment && !choosing) {
    return (
      <EquipmentChoice
        icon={<CircleOff aria-hidden="true" className="size-5" />}
        label="Atendimento geral"
        title="Sem equipamento específico"
        description="A ordem ficará vinculada somente ao cliente e ao local."
        onChange={() => setChoosing(true)}
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow focus-within:border-primary/30 focus-within:shadow-md">
      <div className="relative border-b">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          aria-label="Buscar equipamento"
          className="rounded-none border-0 bg-transparent pl-10 pr-11 shadow-none focus-visible:ring-0"
          placeholder="Busque por nome, identificação ou serial"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search ? (
          <>
            <span
              aria-hidden="true"
              className="absolute right-10 top-1/2 h-5 w-px -translate-y-1/2 bg-border"
            />
            <button
              type="button"
              aria-label="Limpar busca de equipamento"
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-muted-foreground transition-colors hover:text-primary focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setSearch('')}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : null}
      </div>

      <div className="max-h-60 overflow-y-auto p-2">
        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          onClick={() => {
            setSelected(null)
            setWithoutEquipment(true)
            setChoosing(false)
            setSearch('')
            onChange('')
          }}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary">
            <CircleOff aria-hidden="true" className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">
              Sem equipamento específico
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Use para serviços gerais realizados no local.
            </span>
          </span>
        </button>

        <div className="my-2 border-t" />

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Carregando equipamentos…
          </div>
        ) : null}
        {!loading && error ? (
          <p className="px-3 py-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {!loading && !error && result?.items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nenhum equipamento ativo encontrado neste local.
          </p>
        ) : null}
        {!loading && !error
          ? result?.items.map((equipment) => {
              const option = equipmentOption(equipment)
              return (
                <button
                  key={equipment.id}
                  type="button"
                  aria-label={`Selecionar equipamento ${equipment.name}`}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  onClick={() => {
                    setSelected(option)
                    setWithoutEquipment(false)
                    setChoosing(false)
                    setSearch('')
                    onChange(equipment.id)
                  }}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    {equipment.id === value ? (
                      <Check aria-hidden="true" className="size-4" />
                    ) : (
                      <Wrench aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {option.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </span>
                </button>
              )
            })
          : null}
      </div>
    </div>
  )
}

function EquipmentChoice({
  icon,
  label,
  title,
  description,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  title: string
  description: string
  onChange: () => void
}) {
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3 shadow-sm">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {description}
        </p>
      </div>
      <Button
        className="shrink-0"
        type="button"
        size="sm"
        variant="outline"
        aria-label="Alterar equipamento"
        onClick={onChange}
      >
        Alterar
      </Button>
    </div>
  )
}

function equipmentOption(equipment: Equipment): SelectedEquipment {
  return {
    id: equipment.id,
    title: equipment.name,
    description: [equipment.identifier, equipment.category]
      .filter(Boolean)
      .join(' · '),
  }
}
