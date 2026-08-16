import { describe, expect, it } from 'vitest'
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
})
