import type { Metadata } from 'next'

import { ResetPasswordForm } from '@/features/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Redefinir senha | Ciclera',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
