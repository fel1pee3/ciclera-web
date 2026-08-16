import { describe, expect, it } from 'vitest'
import { centsToMoney, moneyToCents } from '@/features/work-orders/schemas'
import { safeWorkOrderReturn } from '@/features/work-orders/work-order-detail'
import {
  readWorkOrderQuery,
  workOrderListUrl,
} from '@/features/work-orders/work-order-list'

describe('work order web foundation', () => {
  it('preserves only valid list filters and safe return URLs', () => {
    const query = readWorkOrderQuery(
      new URLSearchParams('page=2&search=bomba&status=DRAFT&priority=HIGH'),
    )
    expect(workOrderListUrl(query, 2)).toBe(
      '/app/ordens?page=2&search=bomba&status=DRAFT&priority=HIGH',
    )
    expect(safeWorkOrderReturn('//outside.test')).toBe('/app/ordens')
  })
  it('converts money without floating point arithmetic', () => {
    expect(moneyToCents('90071992547409,93')).toBe('9007199254740993')
    expect(centsToMoney('15000')).toBe('150,00')
  })
})
