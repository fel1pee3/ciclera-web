import { clientApiDownload, clientApiRequest } from '@/lib/api/client'
import { importPreviewSchema, importResultSchema } from './contracts'

export function downloadImportTemplate() {
  return clientApiDownload('imports/initial-data/template.csv')
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
