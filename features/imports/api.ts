import {
  clientApiDownload,
  clientApiFormDataRequest,
  clientApiRequest,
} from '@/lib/api/client'
import { importPreviewSchema, importResultSchema } from './contracts'

export function downloadImportTemplate() {
  return clientApiDownload('imports/initial-data/template.csv')
}

export function downloadImportWorkbook() {
  return clientApiDownload('imports/initial-data/template.xlsx')
}

export function previewInitialData(content: string) {
  return clientApiRequest('imports/initial-data/preview', importPreviewSchema, {
    method: 'POST',
    json: { content },
    retryAfterUnauthorized: true,
  })
}

export function commitInitialData(content: string, checksum: string) {
  return clientApiRequest('imports/initial-data/commit', importResultSchema, {
    method: 'POST',
    json: { content, checksum },
    retryAfterUnauthorized: true,
  })
}

export function previewInitialDataWorkbook(file: File) {
  const body = new FormData()
  body.append('file', file)
  return clientApiFormDataRequest(
    'imports/initial-data/preview-file',
    importPreviewSchema,
    body,
    { method: 'POST', retryAfterUnauthorized: true },
  )
}

export function commitInitialDataWorkbook(file: File, checksum: string) {
  const body = new FormData()
  body.append('file', file)
  body.append('checksum', checksum)
  return clientApiFormDataRequest(
    'imports/initial-data/commit-file',
    importResultSchema,
    body,
    { method: 'POST', retryAfterUnauthorized: true },
  )
}
