import type { Metadata } from 'next'

import { ProductPage, productPages } from '@/components/product/product-page'

export const metadata: Metadata = {
  title: 'Gestão de ordens de serviço e agenda',
  description:
    'Organize clientes, locais, equipamentos, equipe, ordens de serviço e agenda em um fluxo operacional conectado.',
  alternates: { canonical: '/produto/gestao-operacional' },
  openGraph: {
    title: 'Gestão de ordens de serviço e agenda | Ciclera',
    description:
      'Planeje a operação com clientes, equipamentos, ordens, equipe e agenda no mesmo fluxo.',
    url: '/produto/gestao-operacional',
  },
}

export default function Page() {
  return <ProductPage data={productPages.operations} />
}
