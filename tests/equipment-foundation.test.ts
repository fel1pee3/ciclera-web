import { describe, expect, it } from 'vitest'

import { safeEquipmentReturn } from '@/features/equipment/equipment-detail'
import { dependentLocationValue } from '@/features/equipment/equipment-form'
import {
  equipmentListUrl,
  readEquipmentQuery,
} from '@/features/equipment/equipment-list'

describe('equipment web foundation', () => {
  it('clears a location whenever the selected customer changes', () => {
    expect(
      dependentLocationValue('customer-a', 'customer-b', 'location-a'),
    ).toBe('')
    expect(
      dependentLocationValue('customer-a', 'customer-a', 'location-a'),
    ).toBe('location-a')
  })

  it('preserves valid list filters and rejects external return URLs', () => {
    const query = readEquipmentQuery(
      new URLSearchParams('page=2&archive=ARCHIVED&search=serial'),
    )
    expect(equipmentListUrl(query, 2)).toBe(
      '/app/equipamentos?page=2&search=serial&archive=ARCHIVED',
    )
    expect(safeEquipmentReturn('//example.test')).toBe('/app/equipamentos')
  })
})
