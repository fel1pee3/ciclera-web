import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Brand({
  inverse = false,
  compact = false,
  animated = false,
}: {
  inverse?: boolean
  compact?: boolean
  animated?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-sans',
        animated ? (compact ? 'gap-0' : 'gap-2.5') : 'gap-2.5',
        animated && 'transition-[gap] duration-300 ease-out',
        inverse ? 'text-primary-foreground' : 'text-foreground',
      )}
    >
      <span className="relative size-10 shrink-0 overflow-hidden">
        <Image
          src="/icon.svg"
          alt="Símbolo da Ciclera"
          fill
          sizes="40px"
          className="object-contain"
          priority
          unoptimized
        />
      </span>
      {(!compact || animated) && (
        <span
          className={cn(
            'whitespace-nowrap font-heading text-xl font-semibold tracking-tight',
            animated &&
              'overflow-hidden transition-[max-width,opacity,transform] duration-300 ease-out',
            animated && compact
              ? 'max-w-0 -translate-x-2 opacity-0'
              : 'max-w-28 translate-x-0 opacity-100',
          )}
        >
          Ciclera
        </span>
      )}
    </span>
  )
}
