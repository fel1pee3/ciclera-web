import type { Metadata, Viewport } from 'next'
import { VercelAnalytics } from '@/components/vercel-analytics'
import { getAppUrl } from '@/lib/app-url'
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME } from '@/lib/seo'
import { inter, sora } from './fonts'
import './globals.css'

const base = getAppUrl()
export const metadata: Metadata = {
  metadataBase: new URL(base),
  applicationName: SITE_NAME,
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOME_DESCRIPTION,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'software de gestão de ordens de serviço',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
  },
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true },
}
export const viewport: Viewport = {
  themeColor: '#092E2E',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`bg-background ${inter.variable} ${sora.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <VercelAnalytics />
      </body>
    </html>
  )
}
