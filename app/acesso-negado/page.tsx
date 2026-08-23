import type { Metadata } from 'next'

import { AccessDenied } from '@/features/auth/session-states'

export const metadata: Metadata = {
  title: 'Acesso negado',
  robots: { index: false, follow: false },
}

export default function AccessDeniedPage() {
  return <AccessDenied />
}
