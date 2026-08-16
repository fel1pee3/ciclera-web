import Link from 'next/link'
import { AlertTriangle, LoaderCircle, LockKeyhole } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function SessionLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6">
      <div className="text-center" role="status">
        <LoaderCircle className="mx-auto size-7 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">
          Verificando sua sessão…
        </p>
      </div>
    </main>
  )
}

export function SessionUnavailable({ retry }: { retry: () => Promise<void> }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-7 text-center shadow-sm">
        <AlertTriangle className="mx-auto size-8 text-warning" />
        <h1 className="mt-4 font-heading text-xl font-semibold">
          Serviço temporariamente indisponível
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Não foi possível confirmar sua sessão. Tente novamente em instantes.
        </p>
        <Button className="mt-6" onClick={() => void retry()}>
          Tentar novamente
        </Button>
      </section>
    </main>
  )
}

export function AccessDenied() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-7 text-center shadow-sm">
        <LockKeyhole className="mx-auto size-8 text-primary" />
        <h1 className="mt-4 font-heading text-xl font-semibold">
          Acesso não permitido
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Seu perfil não possui acesso a esta área. Volte para a área vinculada
          à sua função.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Voltar ao acesso
        </Link>
      </section>
    </main>
  )
}
