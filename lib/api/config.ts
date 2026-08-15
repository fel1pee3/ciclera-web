import { publicEnvironment } from '@/config/public-env'

export const API_BASE_URL = new URL(
  '/api/v1/',
  publicEnvironment.NEXT_PUBLIC_API_URL,
).toString()

export function buildApiUrl(path = ''): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) {
    throw new Error('API paths must be relative')
  }

  return new URL(path.replace(/^\/+/, ''), API_BASE_URL).toString()
}
