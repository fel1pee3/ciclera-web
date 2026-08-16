import { clientApiRequest } from '@/lib/api/client'
import {
  equipmentPageSchema,
  equipmentSchema,
  type EquipmentArchiveFilter,
} from './contracts'
import type { EquipmentFormInput } from './schemas'
import { toEquipmentPayload } from './schemas'

export interface ListEquipmentQuery {
  page: number
  pageSize: number
  search?: string
  archive: EquipmentArchiveFilter
  customerId?: string
  locationId?: string
}

export function listEquipment(query: ListEquipmentQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    archive: query.archive,
  })
  if (query.search) params.set('search', query.search)
  if (query.customerId) params.set('customerId', query.customerId)
  if (query.locationId) params.set('locationId', query.locationId)
  return clientApiRequest(
    `equipment?${params.toString()}`,
    equipmentPageSchema,
    {
      retryAfterUnauthorized: true,
    },
  )
}

export function findEquipment(equipmentId: string) {
  return clientApiRequest(`equipment/${equipmentId}`, equipmentSchema, {
    retryAfterUnauthorized: true,
  })
}

export function createEquipment(input: EquipmentFormInput) {
  return clientApiRequest('equipment', equipmentSchema, {
    method: 'POST',
    json: toEquipmentPayload(input),
    retryAfterUnauthorized: true,
  })
}

export function updateEquipment(
  equipmentId: string,
  input: EquipmentFormInput,
) {
  return clientApiRequest(`equipment/${equipmentId}`, equipmentSchema, {
    method: 'PATCH',
    json: toEquipmentPayload(input),
    retryAfterUnauthorized: true,
  })
}

export function archiveEquipment(equipmentId: string) {
  return clientApiRequest(`equipment/${equipmentId}/archive`, equipmentSchema, {
    method: 'POST',
    retryAfterUnauthorized: true,
  })
}
