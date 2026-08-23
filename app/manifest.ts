import type { MetadataRoute } from 'next'

import { HOME_DESCRIPTION } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ciclera — Gestão de ordens de serviço',
    short_name: 'Ciclera',
    description: HOME_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#F3F8F6',
    theme_color: '#075355',
    lang: 'pt-BR',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
