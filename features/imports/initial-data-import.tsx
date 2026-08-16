'use client'

import { useState } from 'react'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  commitInitialData,
  downloadImportTemplate,
  previewInitialData,
} from './api'
import type { ImportPreview } from './contracts'

export function InitialDataImport() {
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function downloadTemplate() {
    try {
      save(await downloadImportTemplate(), 'modelo-importacao-inicial.csv')
    } catch {
      setError('Não foi possível baixar o modelo.')
    }
  }

  async function selectFile(file?: File) {
    setPreview(null)
    setNotice(null)
    setError(null)
    if (!file) return
    if (file.size > 90_000) {
      setError('O CSV deve possuir no máximo 90 KB.')
      return
    }
    setFileName(file.name)
    setContent(await file.text())
  }

  async function validate() {
    setPending(true)
    setError(null)
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
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="eyebrow">Implantação assistida</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">
          Importar dados iniciais
        </h1>
        <p className="mt-2 text-muted-foreground">
          Exclusivo para proprietários. A gravação é integral: nenhuma linha é
          salva se houver erro.
        </p>
      </header>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}
      <Card className="space-y-4 p-5">
        <Button variant="outline" onClick={() => void downloadTemplate()}>
          Baixar modelo CSV
        </Button>
        <Label className="grid gap-2">
          <span>Arquivo CSV</span>
          <Input
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void selectFile(event.target.files?.[0])}
          />
        </Label>
        {fileName ? (
          <p className="text-sm text-muted-foreground">
            Selecionado: {fileName}
          </p>
        ) : null}
        <Button disabled={!content || pending} onClick={() => void validate()}>
          {pending ? 'Validando…' : 'Gerar prévia'}
        </Button>
      </Card>
      {preview ? (
        <Card className="p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-semibold">
                Resultado da validação
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {preview.totals.valid} válida(s) · {preview.totals.invalid}{' '}
                inválida(s)
              </p>
            </div>
            <Button
              disabled={!preview.ready || pending}
              onClick={() => void commit()}
            >
              {pending ? 'Importando…' : 'Confirmar importação'}
            </Button>
          </div>
          <ul className="mt-5 divide-y divide-border">
            {preview.rows.map((row) => (
              <li className="py-3 text-sm" key={row.line}>
                <strong>Linha {row.line}</strong> · {row.type} ·{' '}
                {row.externalKey}
                {row.errors.map((message) => (
                  <p className="mt-1 text-destructive" key={message}>
                    {message}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </section>
  )
}

function save(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
