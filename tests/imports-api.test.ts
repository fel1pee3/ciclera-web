import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  previewInitialData,
  previewInitialDataWorkbook,
} from '@/features/imports/api'

describe('initial data import API', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('sends CSV content only to the tenant-scoped preview endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          checksum: 'a'.repeat(64),
          ready: false,
          totals: { total: 1, valid: 0, invalid: 1 },
          entities: { customers: 0, locations: 0, equipment: 0 },
          rows: [
            {
              line: 2,
              type: 'CLIENT',
              externalKey: 'x',
              errors: ['erro'],
              status: 'INVALID',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    await expect(previewInitialData('csv')).resolves.toMatchObject({
      ready: false,
    })
    expect(fetchMock.mock.calls[0]?.[0].toString()).toContain(
      'imports/initial-data/preview',
    )
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: 'include',
    })
  })

  it('uploads the Excel workbook as multipart data without JSON headers', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          checksum: 'b'.repeat(64),
          ready: true,
          totals: { total: 3, valid: 3, invalid: 0 },
          entities: { customers: 1, locations: 1, equipment: 1 },
          rows: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    const file = new File(['workbook'], 'modelo.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    await expect(previewInitialDataWorkbook(file)).resolves.toMatchObject({
      ready: true,
    })
    const request = fetchMock.mock.calls[0]
    expect(request?.[0].toString()).toContain(
      'imports/initial-data/preview-file',
    )
    expect(request?.[1]?.body).toBeInstanceOf(FormData)
    expect(new Headers(request?.[1]?.headers).has('Content-Type')).toBe(false)
  })
})
