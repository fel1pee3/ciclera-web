import { describe, expect, it } from 'vitest'
import {
  currencyInputToCents,
  formatCurrencyInput,
} from '@/features/field-work-orders/currency-input'
import { safeFieldReturn } from '@/features/field-work-orders/field-work-order-detail'
import {
  fieldListUrl,
  readFieldQuery,
} from '@/features/field-work-orders/field-work-order-list'

describe('field work order navigation', () => {
  it('preserves valid filters and rejects unsafe returns', () => {
    const query = readFieldQuery(new URLSearchParams('page=2&view=IN_PROGRESS'))
    expect(fieldListUrl(query)).toBe('/field/ordens?page=2&view=IN_PROGRESS')
    expect(safeFieldReturn('//outside.test')).toBe('/field/ordens')
  })

  it('formats field unit amounts as Brazilian currency while typing', () => {
    expect(formatCurrencyInput('1')).toBe('0,01')
    expect(formatCurrencyInput('123')).toBe('1,23')
    expect(formatCurrencyInput('123456')).toBe('1.234,56')
    expect(formatCurrencyInput('R$ 12.345,67')).toBe('12.345,67')
    expect(currencyInputToCents('12.345,67')).toBe('1234567')
    expect(currencyInputToCents('')).toBeNull()
  })
})
