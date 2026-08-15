'use client'

import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  retry: () => void
}

export default function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <main className="container-page flex min-h-screen items-center justify-center py-20">
      <section aria-labelledby="error-title" className="max-w-lg text-center">
        <p className="eyebrow">Algo saiu do esperado</p>
        <h1 id="error-title" className="section-title">
          Não foi possível carregar esta página.
        </h1>
        <p className="section-copy mx-auto">
          Tente novamente. Se o problema continuar, volte à página inicial.
        </p>
        <Button className="mt-8" onClick={retry}>
          Tentar novamente
        </Button>
      </section>
    </main>
  )
}
