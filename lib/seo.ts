export const SITE_NAME = 'Ciclera'
export const SITE_ALTERNATE_NAMES = ['Ciclera', 'ciclera.online']

export const HOME_TITLE = 'Sistema de gestão de ordens de serviço | Ciclera'

export const HOME_DESCRIPTION =
  'Gerencie ordens de serviço, equipes externas, clientes, equipamentos, agenda, execução em campo, fotos, revisão e faturamento em um só sistema.'

export const SOCIAL_TITLE =
  'Ciclera — Gestão de ordens de serviço e equipes externas'

export const SOCIAL_DESCRIPTION =
  'Do planejamento ao faturamento: organize equipe, agenda, execução em campo, evidências e revisão em uma única plataforma.'

export function buildHomeStructuredData(baseUrl: string) {
  const canonicalUrl = new URL('/', baseUrl).toString()
  const organizationId = `${canonicalUrl}#organization`
  const websiteId = `${canonicalUrl}#website`
  const applicationId = `${canonicalUrl}#software`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: SITE_NAME,
        url: canonicalUrl,
        logo: {
          '@type': 'ImageObject',
          url: new URL('/icon.svg', canonicalUrl).toString(),
          width: 512,
          height: 512,
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: canonicalUrl,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        inLanguage: 'pt-BR',
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': applicationId,
        name: SITE_NAME,
        url: canonicalUrl,
        description: HOME_DESCRIPTION,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Gestão de ordens de serviço',
        operatingSystem: 'Web',
        inLanguage: 'pt-BR',
        provider: { '@id': organizationId },
        featureList: [
          'Gestão de ordens de serviço',
          'Agenda e equipes externas',
          'Execução de serviços em campo',
          'Registro de fotos e evidências',
          'Revisão operacional',
          'Controle de serviços prontos para faturar',
        ],
      },
    ],
  }
}
