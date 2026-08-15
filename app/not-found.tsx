import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="container-page flex min-h-screen items-center justify-center py-20">
      <section
        aria-labelledby="not-found-title"
        className="max-w-lg text-center"
      >
        <p className="eyebrow">Erro 404</p>
        <h1 id="not-found-title" className="section-title">
          Página não encontrada.
        </h1>
        <p className="section-copy mx-auto">
          O endereço informado não existe ou não está mais disponível.
        </p>
        <Link href="/" className={buttonVariants({ className: 'mt-8' })}>
          Voltar ao início
        </Link>
      </section>
    </main>
  )
}
