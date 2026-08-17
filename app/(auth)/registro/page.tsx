import type { Metadata } from 'next'

import { RegistrationForm } from '@/features/auth/registration-form'

export const metadata: Metadata = {
  title: 'Criar conta | Ciclera',
  robots: { index: true, follow: true },
}

export default function RegistrationPage() {
  return <RegistrationForm />
}
