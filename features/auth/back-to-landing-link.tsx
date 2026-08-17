import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function BackToLandingLink() {
  return (
    <Link
      className="inline-flex min-h-9 w-fit items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      href="/"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Voltar para o site
    </Link>
  )
}
