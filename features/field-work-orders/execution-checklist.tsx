import { useMemo, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ExecutionChecklist, FieldWorkOrder } from './contracts'
import { saveFieldWorkOrderChecklist } from './api'
import { getFieldWorkOrderErrorMessage } from './errors'

type AnswerValue = string | number | boolean

export function ExecutionChecklistFields({
  order,
  checklist,
  onSaved,
}: {
  order: FieldWorkOrder
  checklist: ExecutionChecklist
  onSaved: (order: FieldWorkOrder) => void
}) {
  const initial = useMemo(
    () =>
      Object.fromEntries(
        checklist.responses.map((answer) => [answer.fieldId, answer.value]),
      ),
    [checklist.responses],
  )
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(initial)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function persist() {
    if (!order.execution) return
    setPending(true)
    setError(null)
    setSaved(false)
    try {
      const responses = checklist.snapshot.fields
        .filter(
          (field) =>
            answers[field.id] !== undefined && answers[field.id] !== '',
        )
        .map((field) => ({ fieldId: field.id, value: answers[field.id] }))
      const updated = await saveFieldWorkOrderChecklist(order.id, {
        version: order.execution.version,
        responses,
      })
      onSaved(updated)
      setSaved(true)
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-5 border-t border-border pt-5">
      <div>
        <h2 className="font-heading text-xl font-bold">
          {checklist.snapshot.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Versão {checklist.snapshot.version}
        </p>
      </div>
      {checklist.snapshot.fields.map((field) => {
        const id = `checklist-${field.id}`
        const value = answers[field.id]
        return (
          <div className="space-y-2" key={field.id}>
            <Label htmlFor={id}>
              {field.label}
              {field.required ? ' *' : ''}
            </Label>
            {field.type === 'LONG_TEXT' ? (
              <Textarea
                id={id}
                rows={5}
                value={typeof value === 'string' ? value : ''}
                onChange={(event) =>
                  setAnswers({ ...answers, [field.id]: event.target.value })
                }
              />
            ) : field.type === 'BOOLEAN' ? (
              <select
                id={id}
                className="input"
                value={typeof value === 'boolean' ? String(value) : ''}
                onChange={(event) =>
                  setAnswers({
                    ...answers,
                    [field.id]: event.target.value === 'true',
                  })
                }
              >
                <option value="">Selecione</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            ) : field.type === 'SELECT' ? (
              <select
                id={id}
                className="input"
                value={typeof value === 'string' ? value : ''}
                onChange={(event) =>
                  setAnswers({ ...answers, [field.id]: event.target.value })
                }
              >
                <option value="">Selecione</option>
                {field.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <Input
                id={id}
                type={field.type === 'NUMBER' ? 'number' : 'text'}
                value={
                  typeof value === 'string' || typeof value === 'number'
                    ? value
                    : ''
                }
                onChange={(event) =>
                  setAnswers({
                    ...answers,
                    [field.id]:
                      field.type === 'NUMBER'
                        ? event.target.valueAsNumber
                        : event.target.value,
                  })
                }
              />
            )}
            {checklist.missingRequiredFieldIds.includes(field.id) ? (
              <p className="text-xs font-medium text-destructive">
                Campo obrigatório ainda não preenchido.
              </p>
            ) : null}
          </div>
        )
      })}
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {saved ? <Alert>Checklist salvo no servidor.</Alert> : null}
      <Button
        className="w-full"
        size="lg"
        disabled={pending}
        onClick={() => void persist()}
      >
        {pending ? 'Salvando checklist…' : 'Salvar checklist'}
      </Button>
    </div>
  )
}
