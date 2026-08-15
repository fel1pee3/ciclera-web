import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Carregando página"
      className="container-page py-20"
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <Skeleton className="h-5 w-32" aria-label="Carregando conteúdo" />
        <Skeleton className="h-12 w-full" aria-hidden="true" />
        <Skeleton className="h-6 w-4/5" aria-hidden="true" />
        <Skeleton className="h-72 w-full" aria-hidden="true" />
      </div>
    </main>
  )
}
