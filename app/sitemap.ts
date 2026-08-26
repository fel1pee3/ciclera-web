import type { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/app-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl()
  const pages = [
    { path: '', changeFrequency: 'weekly', priority: 1 },
    { path: '/como-funciona', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/para-quem', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/planos', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/duvidas', changeFrequency: 'monthly', priority: 0.7 },
    {
      path: '/produto/gestao-operacional',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: '/produto/execucao-em-campo',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: '/produto/revisao-e-faturamento',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: '/politica-de-privacidade',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      path: '/termos-de-uso',
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ] as const

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    changeFrequency,
    priority,
  }))
}
