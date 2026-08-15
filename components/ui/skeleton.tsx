import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Skeleton({
  className,
  'aria-label': ariaLabel = 'Carregando',
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      role="status"
      aria-label={ariaLabel}
      className={cn('animate-pulse rounded-lg bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }
