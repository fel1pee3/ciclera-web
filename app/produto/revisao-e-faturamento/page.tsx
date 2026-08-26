import type { Metadata } from 'next'

import { ProductPage, productPages } from '@/components/product/product-page'

export const metadata: Metadata = {
  title: 'Revisão e serviços prontos para faturar',
  description:
    'Confira observações, fotos e adicionais, solicite correções e organize as ordens aprovadas que já podem seguir para faturamento.',
  alternates: { canonical: '/produto/revisao-e-faturamento' },
  openGraph: {
    title: 'Revisão e serviços prontos para faturar | Ciclera',
    description:
      'Aprove a execução com evidência e organize a passagem do serviço concluído para a cobrança.',
    url: '/produto/revisao-e-faturamento',
  },
}

export default function Page() {
  return <ProductPage data={productPages.review} />
}
