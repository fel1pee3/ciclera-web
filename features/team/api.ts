import type { UserRole } from '@/features/auth/contracts'
import { clientApiRequest } from '@/lib/api/client'
import {
  managedUserSchema,
  paginatedUsersSchema,
  type UserStatus,
} from './contracts'
import type { CreateUserInput, UpdateUserInput } from './schemas'

export interface ListUsersQuery {
  page: number
  pageSize: number
  search?: string
  role?: UserRole
  status?: UserStatus
}

export function listUsers(query: ListUsersQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
  })
  if (query.search) params.set('search', query.search)
  if (query.role) params.set('role', query.role)
  if (query.status) params.set('status', query.status)
  return clientApiRequest(`users?${params.toString()}`, paginatedUsersSchema, {
    retryAfterUnauthorized: true,
  })
}

export function createUser(input: CreateUserInput) {
  return clientApiRequest('users', managedUserSchema, {
    method: 'POST',
    json: input,
    retryAfterUnauthorized: true,
  })
}

export function updateUser(userId: string, input: UpdateUserInput) {
  return clientApiRequest(`users/${userId}`, managedUserSchema, {
    method: 'PATCH',
    json: input,
    retryAfterUnauthorized: true,
  })
}

export function setUserStatus(userId: string, status: UserStatus) {
  const action = status === 'ACTIVE' ? 'activate' : 'deactivate'
  return clientApiRequest(`users/${userId}/${action}`, managedUserSchema, {
    method: 'POST',
    retryAfterUnauthorized: true,
  })
}
