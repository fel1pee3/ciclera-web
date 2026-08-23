import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { OfficeArea } from './office-area'

export const metadata: Metadata = {
  title: 'Painel',
  robots: { index: false, follow: false },
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return <OfficeArea>{children}</OfficeArea>
}
