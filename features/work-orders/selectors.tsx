'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { listEquipment } from '@/features/equipment/api'
import type { EquipmentPage } from '@/features/equipment/contracts'

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

  useEffect(() => {
    if (!customerId || !locationId) return
    let active = true
    const timer = window.setTimeout(() => {
      void listEquipment({
        page: 1,
        pageSize: 50,
        archive: 'ACTIVE',
        customerId,
        locationId,
        ...(search.trim() ? { search: search.trim() } : {}),
      }).then((next) => {
        if (active) setResult(next)
      })
    }, 300)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [customerId, locationId, search])

  return (
    <div className="grid gap-2">
      <Input
        aria-label="Buscar equipamento"
        disabled={!locationId}
        placeholder={
          locationId
            ? 'Digite o nome ou identificação'
            : 'Escolha um local primeiro'
        }
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <select
        aria-label="Equipamento"
        className="input"
        disabled={!locationId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sem equipamento específico</option>
        {value && !result?.items.some((item) => item.id === value) ? (
          <option value={value}>Equipamento selecionado</option>
        ) : null}
        {result?.items.map((equipment) => (
          <option key={equipment.id} value={equipment.id}>
            {equipment.name} · {equipment.identifier}
          </option>
        ))}
      </select>
    </div>
  )
}
