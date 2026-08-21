import type { Metadata } from 'next'

import { RegistrationForm } from '@/features/auth/registration-form'
import { PublicAuthRoute } from '@/features/auth/public-auth-route'

export const metadata: Metadata = {
  title: 'Criar conta | Ciclera',
  robots: { index: true, follow: true },
}

export default function RegistrationPage() {
  return (
    <PublicAuthRoute>
      <RegistrationForm />
    </PublicAuthRoute>
  )
}
