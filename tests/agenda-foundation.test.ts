import { describe, expect, it } from 'vitest'
import {
  formatInTimezone,
  readAgendaQuery,
  zonedLocalDateTimeToIso,
} from '@/features/work-orders/agenda'

describe('administrative agenda foundation', () => {
  it('reads valid URL filters', () => {
    expect(
      readAgendaQuery(
        new URLSearchParams(
          'from=2026-08-17&to=2026-08-23&status=SCHEDULED&technicianId=tech',
        ),
      ),
    ).toMatchObject({
      from: '2026-08-17',
      to: '2026-08-23',
      status: 'SCHEDULED',
      technicianId: 'tech',
    })
  })

  it('converts and presents dates in the organization timezone', () => {
    expect(
      zonedLocalDateTimeToIso('2026-08-17T09:00', 'America/Sao_Paulo'),
    ).toBe('2026-08-17T12:00:00.000Z')
    expect(
      formatInTimezone('2026-08-17T12:00:00.000Z', 'America/Sao_Paulo'),
    ).toContain('09:00')
  })
})
