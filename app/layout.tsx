import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { logoUrl } from '@/components/landing/brand'
import { getAppUrl } from '@/lib/app-url'
import { inter, sora } from './fonts'
import './globals.css'

const base = getAppUrl()
export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: 'Ciclera | Gestão de serviços externos do chamado ao caixa',
  description:
    'Organize ordens de serviço, execução em campo, evidências, revisão e serviços prontos para faturar em uma plataforma web.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Ciclera | Do chamado ao caixa',
    description:
      'Organize o caminho entre execução e faturamento em uma plataforma web.',
    url: '/',
    siteName: 'Ciclera',
    locale: 'pt_BR',
    type: 'website',
    images: [
      { url: logoUrl, width: 1536, height: 1024, alt: 'Símbolo da Ciclera' },
    ],
  },
  robots: { index: true, follow: true },
}
export const viewport: Viewport = {
  themeColor: '#092E2E',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Ciclera',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Plataforma web B2B para gestão de serviços externos entre ordem de serviço e faturamento.',
  url: base,
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`bg-background ${inter.variable} ${sora.variable}`}
    >
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
