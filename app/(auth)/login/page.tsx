import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoginForm } from '@/features/auth/login-form'
import { PublicAuthRoute } from '@/features/auth/public-auth-route'

export const metadata: Metadata = {
  title: 'Entrar | Ciclera',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p role="status">Carregando acesso…</p>}>
      <PublicAuthRoute>
        <LoginForm />
      </PublicAuthRoute>
    </Suspense>
  )
}
