import { useEffect, useRef, useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buildApiUrl } from '@/lib/api/config'
import {
  confirmEvidence,
  createEvidenceIntent,
  getEvidenceReadUrl,
  removeEvidence,
} from './api'
import type { FieldWorkOrder } from './contracts'
import { getFieldWorkOrderErrorMessage } from './errors'
import { uploadEvidenceFile } from './evidence-upload'
import { SignaturePad } from './signature-pad'

interface UploadJob {
  id: string
  file: File
  kind: 'PHOTO' | 'SIGNATURE'
  previewUrl: string
  progress: number
  status: 'READY' | 'UPLOADING' | 'ERROR'
}

export function ExecutionEvidence({
  order,
  onOrderChange,
}: {
  order: FieldWorkOrder
  onOrderChange: (order: FieldWorkOrder) => void
}) {
  const [jobs, setJobs] = useState<UploadJob[]>([])
  const [error, setError] = useState<string | null>(null)
  const [viewUrls, setViewUrls] = useState<Record<string, string>>({})
  const previews = useRef(new Set<string>())
  const busy = jobs.some((job) => job.status === 'UPLOADING')

  useEffect(
    () => () => {
      for (const url of previews.current) URL.revokeObjectURL(url)
      previews.current.clear()
    },
    [],
  )

  function makeJob(file: File, kind: UploadJob['kind']): UploadJob {
    const previewUrl = URL.createObjectURL(file)
    previews.current.add(previewUrl)
    return {
      id: crypto.randomUUID(),
      file,
      kind,
      previewUrl,
      progress: 0,
      status: 'READY',
    }
  }

  function removeJob(job: UploadJob) {
    URL.revokeObjectURL(job.previewUrl)
    previews.current.delete(job.previewUrl)
    setJobs((current) => current.filter((item) => item.id !== job.id))
  }

  async function upload(job: UploadJob) {
    if (!order.execution) return
    setError(null)
    setJobs((current) =>
      current.map((item) =>
        item.id === job.id
          ? { ...item, status: 'UPLOADING', progress: 0 }
          : item,
      ),
    )
    try {
      const created = await createEvidenceIntent(order.id, {
        version: order.execution.version,
        kind: job.kind,
        fileName: job.file.name,
        contentType: job.file.type,
        sizeBytes: job.file.size,
      })
      onOrderChange(created.workOrder)
      await uploadEvidenceFile(
        created.intent.uploadUrl,
        job.file,
        created.intent.contentType,
        (progress) =>
          setJobs((current) =>
            current.map((item) =>
              item.id === job.id ? { ...item, progress } : item,
            ),
          ),
      )
      const updated = await confirmEvidence(
        order.id,
        created.intent.evidenceId,
        created.workOrder.execution?.version ?? 0,
      )
      onOrderChange(updated)
      removeJob(job)
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
      setJobs((current) =>
        current.map((item) =>
          item.id === job.id ? { ...item, status: 'ERROR' } : item,
        ),
      )
    }
  }

  async function view(evidenceId: string) {
    try {
      const result = await getEvidenceReadUrl(evidenceId)
      setViewUrls((current) => ({
        ...current,
        [evidenceId]: buildApiUrl(result.url),
      }))
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    }
  }

  async function remove(evidenceId: string) {
    if (!order.execution) return
    try {
      const updated = await removeEvidence(
        order.id,
        evidenceId,
        order.execution.version,
      )
      onOrderChange(updated)
      setViewUrls((current) => {
        const next = { ...current }
        delete next[evidenceId]
        return next
      })
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    }
  }

  return (
    <div className="space-y-6 border-t border-border pt-5">
      <div>
        <h2 className="font-heading text-xl font-bold">Fotos e assinatura</h2>
        <p className="text-sm text-muted-foreground">
          Os arquivos só aparecem como enviados depois da confirmação do
          servidor.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="evidence-photos">
          Selecionar ou capturar fotos
        </label>
        <Input
          id="evidence-photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          multiple
          disabled={busy}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? [])
            setJobs((current) => [
              ...current,
              ...files.map((file) => makeJob(file, 'PHOTO')),
            ])
            event.target.value = ''
          }}
        />
      </div>

      {jobs.map((job) => (
        <div className="rounded-xl border border-border p-3" key={job.id}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img
            className="max-h-56 w-full rounded-lg object-contain"
            src={job.previewUrl}
            alt="Prévia local"
          />
          <p className="mt-2 truncate text-sm font-medium">{job.file.name}</p>
          {job.status === 'UPLOADING' ? (
            <div className="mt-3" role="status">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs">Enviando: {job.progress}%</p>
            </div>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => removeJob(job)}
            >
              Remover prévia
            </Button>
            <Button disabled={busy} onClick={() => void upload(job)}>
              {job.status === 'ERROR' ? 'Tentar novamente' : 'Enviar'}
            </Button>
          </div>
        </div>
      ))}

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="space-y-3">
        <h3 className="font-semibold">Evidências confirmadas</h3>
        {order.execution?.evidence.length ? (
          order.execution.evidence.map((item) => (
            <div className="rounded-xl border border-border p-3" key={item.id}>
              <p className="truncate text-sm font-semibold">
                {item.kind === 'SIGNATURE' ? 'Assinatura' : item.fileName}
              </p>
              {viewUrls[item.id] ? (
                // eslint-disable-next-line @next/next/no-img-element -- authorized temporary API URL
                <img
                  className="mt-3 max-h-64 w-full rounded-lg object-contain"
                  src={viewUrls[item.id]}
                  alt={
                    item.kind === 'SIGNATURE'
                      ? 'Assinatura confirmada'
                      : 'Evidência confirmada'
                  }
                />
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => void view(item.id)}>
                  Visualizar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void remove(item.id)}
                >
                  Remover
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma evidência confirmada.
          </p>
        )}
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="font-semibold">Assinatura do responsável</h3>
        <SignaturePad
          disabled={busy}
          onConfirm={(file) => {
            const job = makeJob(file, 'SIGNATURE')
            setJobs((current) => [...current, job])
            void upload(job)
          }}
        />
      </div>
    </div>
  )
}
