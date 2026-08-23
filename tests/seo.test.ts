import { describe, expect, it } from 'vitest'

import manifest from '@/app/manifest'
import { metadata as homeMetadata } from '@/app/page'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import {
  buildHomeStructuredData,
  HOME_DESCRIPTION,
  HOME_TITLE,
  SOCIAL_DESCRIPTION,
  SOCIAL_TITLE,
} from '@/lib/seo'

describe('public search metadata', () => {
  it('describes the product consistently for search and link previews', () => {
    expect(homeMetadata.title).toEqual({ absolute: HOME_TITLE })
    expect(homeMetadata.description).toBe(HOME_DESCRIPTION)
    expect(homeMetadata.alternates).toEqual({ canonical: '/' })
    expect(homeMetadata.openGraph).toMatchObject({
      title: SOCIAL_TITLE,
      description: SOCIAL_DESCRIPTION,
      siteName: 'Ciclera',
      locale: 'pt_BR',
      type: 'website',
    })
    expect(homeMetadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: SOCIAL_TITLE,
      description: SOCIAL_DESCRIPTION,
    })
  })

  it('publishes WebSite, Organization and SoftwareApplication structured data', () => {
    const structuredData = buildHomeStructuredData('https://ciclera.online')

    expect(structuredData['@graph']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'Organization',
          name: 'Ciclera',
        }),
        expect.objectContaining({
          '@type': 'WebSite',
          name: 'Ciclera',
          alternateName: ['Ciclera', 'ciclera.online'],
        }),
        expect.objectContaining({
          '@type': 'SoftwareApplication',
          applicationSubCategory: 'Gestão de ordens de serviço',
        }),
      ]),
    )
  })

  it('keeps the sitemap focused on useful public pages', () => {
    const urls = sitemap().map((entry) => entry.url)

    expect(urls).toEqual([
      'http://localhost:3000',
      'http://localhost:3000/politica-de-privacidade',
      'http://localhost:3000/termos-de-uso',
    ])
    expect(urls).not.toContain('http://localhost:3000/registro')
  })

  it('publishes crawler and browser discovery files with Ciclera branding', () => {
    expect(robots()).toMatchObject({
      sitemap: 'http://localhost:3000/sitemap.xml',
      host: 'http://localhost:3000',
    })
    expect(manifest()).toMatchObject({
      name: 'Ciclera — Gestão de ordens de serviço',
      short_name: 'Ciclera',
      theme_color: '#075355',
      icons: [expect.objectContaining({ src: '/icon.svg' })],
    })
  })
})
