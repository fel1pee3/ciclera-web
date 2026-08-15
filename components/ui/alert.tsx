import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const alertVariants = cva('rounded-xl border p-4 text-sm', {
  variants: {
    variant: {
      default: 'border-border bg-card text-card-foreground',
      success: 'border-active/30 bg-active/10 text-primary',
      destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
    },
  },
  defaultVariants: { variant: 'default' },
})

function Alert({
  className,
  variant,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="alert-title"
      className={cn('font-semibold', className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="alert-description"
      className={cn('leading-relaxed', className)}
      {...props}
    />
  )
}

export { Alert, AlertDescription, AlertTitle }
