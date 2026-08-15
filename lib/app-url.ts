import { publicEnvironment } from '@/config/public-env'

export function getAppUrl(): string {
  return publicEnvironment.NEXT_PUBLIC_APP_URL
}
