import type { Metadata } from 'next'

import { ForgotPasswordForm } from '@/features/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar senha',
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
