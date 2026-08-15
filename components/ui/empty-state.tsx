import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface EmptyStateProps extends ComponentProps<'section'> {
  title: string
  description?: string
  action?: ReactNode
}

function EmptyState({
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <section
      data-slot="empty-state"
      aria-label={title}
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed border-border bg-card p-8 text-center',
        className,
      )}
      {...props}
    >
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </section>
  )
}

export { EmptyState }
