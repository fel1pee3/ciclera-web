'use client'

import { useState, type DragEvent, type ReactElement } from 'react'
import {
  Building2,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
  UploadCloud,
  Wrench,
  X,
  XCircle,
} from 'lucide-react'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  commitInitialData,
  downloadImportTemplate,
  previewInitialData,
} from './api'
import type { ImportPreview } from './contracts'

const maxFileSize = 90_000

export function InitialDataImport() {
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [inputKey, setInputKey] = useState(0)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [pending, setPending] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [confirmingImport, setConfirmingImport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function downloadTemplate() {
    setDownloading(true)
    setError(null)
    try {
      save(await downloadImportTemplate(), 'modelo-importacao-inicial.csv')
    } catch {
      setError('Não foi possível baixar o modelo.')
    } finally {
      setDownloading(false)
    }
  }

  async function selectFile(file?: File) {
    setInputKey((value) => value + 1)
    setPreview(null)
    setNotice(null)
    setError(null)
    setContent('')
    setFileName('')
    setFileSize(0)
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Selecione um arquivo no formato CSV.')
      return
    }
    if (file.size > maxFileSize) {
      setError('O CSV deve possuir no máximo 90 KB.')
      return
    }
    try {
      setFileName(file.name)
      setFileSize(file.size)
      setContent(await file.text())
    } catch {
      setError('Não foi possível ler o arquivo selecionado.')
    }
  }

  async function validate() {
    setPending(true)
    setError(null)
    setNotice(null)
    try {
      setPreview(await previewInitialData(content))
    } catch {
      setError('O CSV não pôde ser validado. Use o modelo oficial.')
    } finally {
      setPending(false)
    }
  }

  async function commit() {
    if (!preview?.ready) return
    setPending(true)
    setError(null)
    try {
      const result = await commitInitialData(content, preview.checksum)
      setNotice(
        result.status === 'ALREADY_IMPORTED'
          ? 'Este mesmo arquivo já havia sido importado. Nenhum registro foi duplicado.'
          : `Importação concluída: ${result.counts.customers} cliente(s), ${result.counts.locations} local(is) e ${result.counts.equipment} equipamento(s).`,
      )
    } catch {
      setError('A importação não foi concluída. Gere uma nova prévia.')
    } finally {
      setPending(false)
      setConfirmingImport(false)
    }
  }

  function dropFile(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    void selectFile(event.dataTransfer.files[0])
  }

  const currentStep = preview ? 3 : content ? 2 : 1

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="max-w-3xl">
        <p className="eyebrow">Implantação assistida</p>
        <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
          Importe sua operação com segurança
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Cadastre clientes, locais e equipamentos a partir de uma única
          planilha. Você revisa tudo antes de qualquer informação ser salva.
        </p>
      </header>

      <Card className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
        <Step
          number={1}
          title="Baixe o modelo"
          description="Use as colunas oficiais"
          active={currentStep === 1}
          complete={currentStep > 1}
        />
        <Step
          number={2}
          title="Envie o CSV"
          description="Validamos linha por linha"
          active={currentStep === 2}
          complete={currentStep > 2}
        />
        <Step
          number={3}
          title="Revise e confirme"
          description="Nada é salvo antes disso"
          active={currentStep === 3}
          complete={Boolean(notice)}
        />
      </Card>

      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="flex flex-col justify-between gap-6 p-5 sm:p-6 lg:col-span-2">
          <div>
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <FileSpreadsheet aria-hidden="true" className="size-6" />
            </span>
            <p className="mt-5 text-xs font-semibold tracking-wider text-primary uppercase">
              Passo 1
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold">
              Prepare sua planilha
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Baixe o arquivo oficial, abra no Excel ou Google Planilhas e
              mantenha os nomes das colunas.
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              <ImportEntity icon={<Building2 />} label="Clientes" />
              <ImportEntity icon={<MapPin />} label="Locais de atendimento" />
              <ImportEntity icon={<Wrench />} label="Equipamentos" />
            </ul>
          </div>
          <Button
            className="w-full"
            variant="outline"
            disabled={downloading}
            onClick={() => void downloadTemplate()}
          >
            <Download aria-hidden="true" />
            {downloading ? 'Baixando…' : 'Baixar modelo CSV'}
          </Button>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-3">
          <p className="text-xs font-semibold tracking-wider text-primary uppercase">
            Passo 2
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold">
            Selecione o arquivo preenchido
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Arquivo CSV de até 90 KB. A prévia não grava nenhum dado.
          </p>

          <label
            className={cn(
              'mt-5 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors',
              dragging
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5',
            )}
            htmlFor="initial-import-file"
            onDragEnter={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={dropFile}
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-card text-primary shadow-sm">
              <UploadCloud aria-hidden="true" className="size-7" />
            </span>
            <strong className="mt-4">
              Arraste o CSV aqui ou clique para procurar
            </strong>
            <span className="mt-1 text-sm text-muted-foreground">
              Somente arquivos .csv
            </span>
          </label>
          <Input
            key={inputKey}
            className="sr-only"
            id="initial-import-file"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void selectFile(event.target.files?.[0])}
          />

          {fileName ? (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileCheck2 aria-hidden="true" className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileSize)} · pronto para validar
                  </p>
                </div>
              </div>
              <Button
                className="shrink-0"
                type="button"
                variant="ghost"
                onClick={() => void selectFile()}
              >
                <X aria-hidden="true" />
                Remover
              </Button>
            </div>
          ) : null}

          <Button
            className="mt-5 w-full"
            size="lg"
            disabled={!content || pending}
            onClick={() => void validate()}
          >
            <ShieldCheck aria-hidden="true" />
            {pending ? 'Validando arquivo…' : 'Validar e gerar prévia'}
          </Button>
        </Card>
      </div>

      {preview ? (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-4 border-b bg-muted/30 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-2xl',
                  preview.ready
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-destructive/10 text-destructive',
                )}
              >
                {preview.ready ? (
                  <CheckCircle2 aria-hidden="true" className="size-6" />
                ) : (
                  <XCircle aria-hidden="true" className="size-6" />
                )}
              </span>
              <div>
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Passo 3
                </p>
                <h2 className="font-heading text-xl font-bold">
                  {preview.ready
                    ? 'Arquivo pronto para importar'
                    : 'Corrija o arquivo antes de continuar'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {preview.totals.total} linha(s) analisada(s)
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'w-fit',
                preview.ready
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-destructive/20 bg-destructive/5 text-destructive',
              )}
            >
              {preview.ready ? 'Validação aprovada' : 'Há erros no CSV'}
            </Badge>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Summary label="Clientes" value={preview.entities.customers} />
              <Summary label="Locais" value={preview.entities.locations} />
              <Summary
                label="Equipamentos"
                value={preview.entities.equipment}
              />
              <Summary
                label="Linhas válidas"
                value={preview.totals.valid}
                success
              />
              <Summary
                label="Linhas com erro"
                value={preview.totals.invalid}
                destructive={preview.totals.invalid > 0}
              />
            </div>

            <div className="overflow-hidden rounded-xl border">
              <div className="hidden grid-cols-[5rem_8rem_1fr_8rem] gap-3 bg-muted/50 px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid">
                <span>Linha</span>
                <span>Tipo</span>
                <span>Identificador</span>
                <span>Status</span>
              </div>
              <ul className="divide-y divide-border">
                {preview.rows.map((row) => (
                  <li className="p-4 text-sm" key={row.line}>
                    <div className="grid gap-2 sm:grid-cols-[5rem_8rem_1fr_8rem] sm:items-center sm:gap-3">
                      <strong>Linha {row.line}</strong>
                      <span>{importTypeLabel(row.type)}</span>
                      <span className="break-all text-muted-foreground">
                        {row.externalKey}
                      </span>
                      <span
                        className={cn(
                          'inline-flex w-fit items-center gap-1 font-semibold',
                          row.status === 'VALID'
                            ? 'text-emerald-700'
                            : 'text-destructive',
                        )}
                      >
                        {row.status === 'VALID' ? (
                          <Check aria-hidden="true" className="size-4" />
                        ) : (
                          <X aria-hidden="true" className="size-4" />
                        )}
                        {row.status === 'VALID' ? 'Válida' : 'Com erro'}
                      </span>
                    </div>
                    {row.errors.map((message) => (
                      <p
                        className="mt-2 rounded-lg bg-destructive/5 px-3 py-2 text-destructive sm:ml-[13.75rem]"
                        key={message}
                      >
                        {message}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-sm text-muted-foreground">
                A importação é integral: se qualquer linha tiver erro, nenhum
                cliente, local ou equipamento será salvo.
              </p>
              <Button
                className="w-full shrink-0 sm:w-auto"
                size="lg"
                disabled={!preview.ready || pending}
                onClick={() => setConfirmingImport(true)}
              >
                <FileCheck2 aria-hidden="true" />
                Confirmar importação
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <ConfirmDialog
        open={confirmingImport}
        title="Importar os dados validados?"
        description={
          preview
            ? `Serão processados ${preview.entities.customers} cliente(s), ${preview.entities.locations} local(is) e ${preview.entities.equipment} equipamento(s). O mesmo arquivo não será duplicado se for enviado novamente.`
            : ''
        }
        confirmLabel="Sim, importar dados"
        pendingLabel="Importando…"
        pending={pending}
        onCancel={() => setConfirmingImport(false)}
        onConfirm={() => void commit()}
      />
    </section>
  )
}

function Step({
  active,
  complete,
  description,
  number,
  title,
}: {
  active: boolean
  complete: boolean
  description: string
  number: number
  title: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2',
        active && 'bg-primary/5',
      )}
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold',
          complete
            ? 'bg-primary text-primary-foreground'
            : active
              ? 'border-2 border-primary bg-card text-primary'
              : 'bg-muted text-muted-foreground',
        )}
      >
        {complete ? <Check aria-hidden="true" className="size-4" /> : number}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ImportEntity({
  icon,
  label,
}: {
  icon: ReactElement<{ className?: string }>
  label: string
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-8 place-items-center rounded-lg bg-muted text-primary [&_svg]:size-4">
        {icon}
      </span>
      <span>{label}</span>
    </li>
  )
}

function Summary({
  destructive = false,
  label,
  success = false,
  value,
}: {
  destructive?: boolean
  label: string
  success?: boolean
  value: number
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <strong
        className={cn(
          'mt-1 block font-heading text-2xl',
          success && 'text-emerald-700',
          destructive && 'text-destructive',
        )}
      >
        {value}
      </strong>
    </div>
  )
}

function importTypeLabel(value: string) {
  if (value === 'CLIENT') return 'Cliente'
  if (value === 'LOCATION') return 'Local'
  if (value === 'EQUIPMENT') return 'Equipamento'
  return value
}

function formatFileSize(bytes: number) {
  if (bytes < 1_000) return `${bytes} bytes`
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(bytes / 1_000)} KB`
}

function save(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
