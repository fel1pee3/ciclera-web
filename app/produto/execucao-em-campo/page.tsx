import type { Metadata } from 'next'

import { ProductPage, productPages } from '@/components/product/product-page'

export const metadata: Metadata = {
  title: 'Execução de serviços em campo',
  description:
    'Dê ao técnico uma experiência responsiva para consultar a ordem, registrar diagnóstico, fotos e adicionais e enviar o atendimento para revisão.',
  alternates: { canonical: '/produto/execucao-em-campo' },
  openGraph: {
    title: 'Execução de serviços em campo | Ciclera',
    description:
      'Uma interface direta para o técnico executar e documentar cada atendimento atribuído.',
    url: '/produto/execucao-em-campo',
  },
}

export default function Page() {
  return <ProductPage data={productPages.field} />
}
