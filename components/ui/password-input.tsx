'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import { Input } from './input'

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>

export function PasswordInput({
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye
  const action = visible ? 'Ocultar senha' : 'Mostrar senha'

  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn('pr-12', className)}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-1 my-auto inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
        onClick={() => setVisible((current) => !current)}
        aria-label={action}
        aria-pressed={visible}
        title={action}
        disabled={disabled}
      >
        <Icon aria-hidden="true" className="size-[18px]" />
      </button>
    </div>
  )
}
