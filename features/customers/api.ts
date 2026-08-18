import { clientApiRequest } from '@/lib/api/client'
import {
  customerPageSchema,
  customerSchema,
  locationPageSchema,
  serviceLocationSchema,
  type ArchiveFilter,
  type LocationStatus,
} from './contracts'
import type { CustomerFormInput, LocationFormInput } from './schemas'
import { toCustomerPayload, toLocationPayload } from './schemas'

export interface ListCustomersQuery {
  page: number
  pageSize: number
  search?: string
  archive: ArchiveFilter
}

export interface ListLocationsQuery {
  page: number
  pageSize: number
  search?: string
  status?: LocationStatus
}

export function listCustomers(query: ListCustomersQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    archive: query.archive,
  })
  if (query.search) params.set('search', query.search)
  return clientApiRequest(
    `customers?${params.toString()}`,
    customerPageSchema,
    { retryAfterUnauthorized: true },
  )
}

export function findCustomer(customerId: string) {
  return clientApiRequest(`customers/${customerId}`, customerSchema, {
    retryAfterUnauthorized: true,
  })
}

export function createCustomer(input: CustomerFormInput) {
  return clientApiRequest('customers', customerSchema, {
    method: 'POST',
    json: toCustomerPayload(input),
    retryAfterUnauthorized: true,
  })
}

export function updateCustomer(customerId: string, input: CustomerFormInput) {
  return clientApiRequest(`customers/${customerId}`, customerSchema, {
    method: 'PATCH',
    json: toCustomerPayload(input),
    retryAfterUnauthorized: true,
  })
}

export function archiveCustomer(customerId: string) {
  return clientApiRequest(`customers/${customerId}/archive`, customerSchema, {
    method: 'POST',
    retryAfterUnauthorized: true,
  })
}

export function reactivateCustomer(customerId: string) {
  return clientApiRequest(
    `customers/${customerId}/reactivate`,
    customerSchema,
    {
      method: 'POST',
      retryAfterUnauthorized: true,
    },
  )
}

export function listLocations(customerId: string, query: ListLocationsQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })
  if (query.search) params.set('search', query.search)
  if (query.status) params.set('status', query.status)
  return clientApiRequest(
    `customers/${customerId}/locations?${params.toString()}`,
    locationPageSchema,
    { retryAfterUnauthorized: true },
  )
}

export function createLocation(customerId: string, input: LocationFormInput) {
  return clientApiRequest(
    `customers/${customerId}/locations`,
    serviceLocationSchema,
    {
      method: 'POST',
      json: toLocationPayload(input),
      retryAfterUnauthorized: true,
    },
  )
}

export function findLocation(locationId: string) {
  return clientApiRequest(`locations/${locationId}`, serviceLocationSchema, {
    retryAfterUnauthorized: true,
  })
}

export function updateLocation(locationId: string, input: LocationFormInput) {
  return clientApiRequest(`locations/${locationId}`, serviceLocationSchema, {
    method: 'PATCH',
    json: toLocationPayload(input),
    retryAfterUnauthorized: true,
  })
}
