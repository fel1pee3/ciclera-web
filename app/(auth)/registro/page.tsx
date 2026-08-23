import type { Metadata } from 'next'

import { RegistrationForm } from '@/features/auth/registration-form'
import { PublicAuthRoute } from '@/features/auth/public-auth-route'

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua organização e comece a usar a Ciclera.',
  robots: { index: false, follow: false },
}

export default function RegistrationPage() {
  return (
    <PublicAuthRoute>
      <RegistrationForm />
    </PublicAuthRoute>
  )
}
