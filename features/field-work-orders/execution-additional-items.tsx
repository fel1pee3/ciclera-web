import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { centsToMoney, moneyToCents } from '@/features/work-orders/schemas'
import {
  createAdditionalItem,
  removeAdditionalItem,
  updateAdditionalItem,
} from './api'
import type { AdditionalItem, FieldWorkOrder } from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'

const labels = {
  MATERIAL: 'Material',
  SERVICE: 'Serviço',
  ADDITIONAL_HOUR: 'Hora adicional',
} as const

export function ExecutionAdditionalItems({
  order,
  onOrderChange,
}: {
  order: FieldWorkOrder
  onOrderChange: (order: FieldWorkOrder) => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<AdditionalItem['type']>('MATERIAL')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitAmount, setUnitAmount] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setEditingId(null)
    setType('MATERIAL')
    setDescription('')
    setQuantity('1')
    setUnitAmount('')
  }

  function edit(item: AdditionalItem) {
    setEditingId(item.id)
    setType(item.type)
    setDescription(item.description)
    setQuantity(item.quantity)
    setUnitAmount(centsToMoney(item.unitAmountInCents))
  }

  async function save() {
    if (!order.execution) return
    const cents = moneyToCents(unitAmount)
    const normalizedQuantity = quantity.trim().replace(',', '.')
    if (
      !description.trim() ||
      !cents ||
      !/^\d+(?:\.\d{1,3})?$/.test(normalizedQuantity)
    ) {
      setError('Informe descrição, quantidade e valor unitário válidos.')
      return
    }
    setPending(true)
    setError(null)
    try {
      const input = {
        version: order.execution.version,
        type,
        description: description.trim(),
        quantity: normalizedQuantity,
        unitAmountInCents: cents,
      }
      const updated = editingId
        ? await updateAdditionalItem(order.id, editingId, input)
        : await createAdditionalItem(order.id, input)
      onOrderChange(updated)
      reset()
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }

  async function remove(itemId: string) {
    if (!order.execution || !window.confirm('Remover este item adicional?'))
      return
    try {
      onOrderChange(
        await removeAdditionalItem(order.id, itemId, order.execution.version),
      )
      if (editingId === itemId) reset()
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    }
  }

  return (
    <div className="space-y-5 border-t border-border pt-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold">
            Materiais e adicionais
          </h2>
          <p className="text-sm text-muted-foreground">
            O total oficial é calculado pela API.
          </p>
        </div>
        <strong>
          {formatMoney(order.execution?.additionalTotalInCents ?? '0')}
        </strong>
      </div>

      {order.execution?.additionalItems.map((item) => (
        <div className="rounded-xl border border-border p-3" key={item.id}>
          <div className="flex justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {labels[item.type]}
              </p>
              <p className="font-semibold">{item.description}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} × {formatMoney(item.unitAmountInCents)}
              </p>
            </div>
            <strong>{formatMoney(item.totalAmountInCents)}</strong>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => edit(item)}>
              Editar
            </Button>
            <Button variant="destructive" onClick={() => void remove(item.id)}>
              Remover
            </Button>
          </div>
        </div>
      ))}

      <div className="space-y-3 rounded-xl bg-muted/40 p-4">
        <Label className="grid gap-2">
          <span>Tipo</span>
          <select
            className="input"
            value={type}
            onChange={(event) =>
              setType(event.target.value as AdditionalItem['type'])
            }
          >
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Label>
        <Label className="grid gap-2">
          <span>Descrição</span>
          <Input
            maxLength={500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Label className="grid gap-2">
            <span>Quantidade</span>
            <Input
              inputMode="decimal"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </Label>
          <Label className="grid gap-2">
            <span>Valor unitário (R$)</span>
            <Input
              inputMode="decimal"
              value={unitAmount}
              onChange={(event) => setUnitAmount(event.target.value)}
            />
          </Label>
        </div>
        {error ? <Alert variant="destructive">{error}</Alert> : null}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" disabled={pending} onClick={reset}>
            Limpar
          </Button>
          <Button disabled={pending} onClick={() => void save()}>
            {pending
              ? 'Salvando…'
              : editingId
                ? 'Salvar alteração'
                : 'Adicionar item'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatMoney(cents: string) {
  const value = BigInt(cents)
  const hundred = BigInt(100)
  const whole = value / hundred
  const fraction = (value % hundred).toString().padStart(2, '0')
  return `R$ ${whole.toLocaleString('pt-BR')},${fraction}`
}
