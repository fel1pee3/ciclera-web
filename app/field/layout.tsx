import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { FieldArea } from './field-area'

export const metadata: Metadata = {
  title: 'Área de campo',
  robots: { index: false, follow: false },
}

export default function FieldLayout({ children }: { children: ReactNode }) {
  return <FieldArea>{children}</FieldArea>
}
