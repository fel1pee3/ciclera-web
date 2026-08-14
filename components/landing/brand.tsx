import Image from 'next/image'
import { cn } from '@/lib/utils'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%2012%20de%20ago.%20de%202026%2C%2012_09_41-3gRKzJwfmM5km8GbXoEiN24aUzUfAW.png'

export function Brand({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 font-sans', inverse ? 'text-primary-foreground' : 'text-foreground')}>
      <span className="relative size-10 shrink-0 overflow-hidden">
        <Image
          src={logoUrl}
          alt="Símbolo da Ciclera"
          fill
          sizes="40px"
          className="object-contain"
          priority
          unoptimized
        />
      </span>
      {!compact && <span className="font-heading text-xl font-semibold tracking-tight">Ciclera</span>}
    </span>
  )
}

export { logoUrl }
