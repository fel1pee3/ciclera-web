import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  ChevronUp,
  Eye,
  ImagePlus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

interface UploadJob {
  id: string
  file: File
  previewUrl: string
  progress: number
  status: 'READY' | 'UPLOADING' | 'ERROR'
}

const acceptedImages = 'image/jpeg,image/png,image/webp'

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
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const busy = jobs.some((job) => job.status === 'UPLOADING')

  useEffect(
    () => () => {
      for (const url of previews.current) URL.revokeObjectURL(url)
      previews.current.clear()
    },
    [],
  )

  function makeJob(file: File): UploadJob {
    const previewUrl = URL.createObjectURL(file)
    previews.current.add(previewUrl)
    return {
      id: crypto.randomUUID(),
      file,
      previewUrl,
      progress: 0,
      status: 'READY',
    }
  }

  function addFiles(files: FileList | null) {
    const selected = Array.from(files ?? [])
    if (!selected.length) return
    setJobs((current) => [...current, ...selected.map(makeJob)])
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

  function minimize(evidenceId: string) {
    setViewUrls((current) => {
      const next = { ...current }
      delete next[evidenceId]
      return next
    })
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
      minimize(evidenceId)
    } catch (reason: unknown) {
      setError(getFieldWorkOrderErrorMessage(reason))
    }
  }

  return (
    <Card className="space-y-6 p-5 sm:p-6">
      <div>
        <h2 className="font-heading text-xl font-bold">Fotos do atendimento</h2>
        <p className="text-sm text-muted-foreground">
          Registre o serviço pela câmera ou envie imagens já salvas no
          dispositivo.
        </p>
      </div>

      <input
        ref={cameraInput}
        hidden
        type="file"
        accept={acceptedImages}
        capture="environment"
        disabled={busy}
        onChange={(event) => {
          addFiles(event.target.files)
          event.target.value = ''
        }}
      />
      <input
        ref={galleryInput}
        hidden
        type="file"
        accept={acceptedImages}
        multiple
        disabled={busy}
        onChange={(event) => {
          addFiles(event.target.files)
          event.target.value = ''
        }}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-label="Tirar foto"
          disabled={busy}
          className="group flex min-h-24 items-center gap-4 rounded-xl border border-primary/25 bg-primary/[0.04] p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => cameraInput.current?.click()}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Camera aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-foreground">
              Tirar foto
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Abrir a câmera do dispositivo
            </span>
          </span>
        </button>
        <button
          type="button"
          aria-label="Escolher da galeria"
          disabled={busy}
          className="group flex min-h-24 items-center gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => galleryInput.current?.click()}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <ImagePlus aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block font-semibold text-foreground">
              Escolher da galeria
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Selecionar uma ou várias imagens
            </span>
          </span>
        </button>
      </div>

      {jobs.length ? (
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">Prontas para enviar</h3>
            <p className="text-xs text-muted-foreground">
              Confira cada imagem antes de confirmar o envio.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <div
                className="overflow-hidden rounded-xl border bg-card shadow-sm"
                key={job.id}
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-muted/50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                  <img
                    className="max-h-full max-w-full rounded-lg object-contain"
                    src={job.previewUrl}
                    alt={`Prévia de ${job.file.name}`}
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">
                    {job.file.name}
                  </p>
                  {job.status === 'UPLOADING' ? (
                    <div className="mt-3" role="status">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-[width]"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Enviando: {job.progress}%
                      </p>
                    </div>
                  ) : null}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => removeJob(job)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Remover
                    </Button>
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void upload(job)}
                    >
                      {job.status === 'ERROR' ? (
                        <RotateCcw aria-hidden="true" className="size-4" />
                      ) : (
                        <Upload aria-hidden="true" className="size-4" />
                      )}
                      {job.status === 'ERROR' ? 'Tentar novamente' : 'Enviar'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="space-y-3 border-t pt-5">
        <div>
          <h3 className="font-semibold">Fotos enviadas</h3>
          <p className="text-xs text-muted-foreground">
            Evidências já confirmadas e protegidas pelo servidor.
          </p>
        </div>
        {order.execution?.evidence.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {order.execution.evidence.map((item) => {
              const isOpen = Boolean(viewUrls[item.id])
              return (
                <div
                  className="overflow-hidden rounded-xl border bg-card shadow-sm"
                  key={item.id}
                >
                  <div className="flex items-center gap-3 p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <ImagePlus aria-hidden="true" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Envio confirmado
                      </p>
                    </div>
                  </div>
                  {isOpen ? (
                    <div className="flex aspect-[4/3] items-center justify-center border-y bg-muted/40 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element -- authorized temporary API URL */}
                      <img
                        className="max-h-full max-w-full rounded-lg object-contain"
                        crossOrigin="use-credentials"
                        src={viewUrls[item.id]}
                        alt={`Foto enviada: ${item.fileName}`}
                      />
                    </div>
                  ) : null}
                  <div className="grid grid-cols-2 gap-2 p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        isOpen ? minimize(item.id) : void view(item.id)
                      }
                    >
                      {isOpen ? (
                        <ChevronUp aria-hidden="true" className="size-4" />
                      ) : (
                        <Eye aria-hidden="true" className="size-4" />
                      )}
                      {isOpen ? 'Minimizar' : 'Visualizar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void remove(item.id)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed px-4 py-8 text-center">
            <ImagePlus
              aria-hidden="true"
              className="mx-auto size-6 text-muted-foreground"
            />
            <p className="mt-2 text-sm font-medium">Nenhuma foto enviada</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use a câmera ou escolha imagens da galeria.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
