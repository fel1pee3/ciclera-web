'use client'

import Link from 'next/link'

import { Button, buttonVariants } from '@/components/ui/button'
import { inter, sora } from './fonts'
import './globals.css'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  retry: () => void
}

export default function GlobalError({ retry }: GlobalErrorProps) {
  return (
    <html
      lang="pt-BR"
      className={`bg-background ${inter.variable} ${sora.variable}`}
    >
      <body className="font-sans antialiased">
        <title>Ciclera | Erro</title>
        <main className="container-page flex min-h-screen items-center justify-center py-20">
          <section
            aria-labelledby="global-error-title"
            className="max-w-lg text-center"
          >
            <p className="eyebrow">Algo saiu do esperado</p>
            <h1 id="global-error-title" className="section-title">
              Não foi possível carregar a Ciclera.
            </h1>
            <p className="section-copy mx-auto">
              Tente novamente ou retorne à página inicial.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={retry}>
                Tentar novamente
              </Button>
              <Link href="/" className={buttonVariants({ variant: 'outline' })}>
                Voltar ao início
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
