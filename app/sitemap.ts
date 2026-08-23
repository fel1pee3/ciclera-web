import type { MetadataRoute } from 'next'
import { getAppUrl } from '@/lib/app-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl()
  return ['', '/politica-de-privacidade', '/termos-de-uso'].map(
    (path, index) => ({
      url: `${base}${path}`,
      changeFrequency: index === 0 ? 'weekly' : 'yearly',
      priority: index === 0 ? 1 : 0.3,
    }),
  )
}
