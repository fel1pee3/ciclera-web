'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import { useSession } from './session-provider'

export function LogoutButton({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const router = useRouter()
  const { signOut } = useSession()
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  return (
    <>
      <Button
        type="button"
        className={cn(
          'overflow-hidden text-muted-foreground transition-[padding,gap,color,background-color,border-color] duration-300 hover:border-destructive/20 hover:bg-destructive/5 hover:text-destructive',
          'pl-5',
          compact ? 'gap-0 pr-0' : 'gap-2 pr-4',
          className,
        )}
        variant="outline"
        title={compact ? 'Sair' : undefined}
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        <LogOut aria-hidden="true" className="size-4 shrink-0" />
        <span
          className={cn(
            'whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out',
            compact
              ? 'max-w-0 -translate-x-2 opacity-0'
              : 'max-w-20 translate-x-0 opacity-100',
          )}
        >
          {pending ? 'Saindo…' : 'Sair'}
        </span>
      </Button>
      <ConfirmDialog
        open={confirming}
        title="Sair da Ciclera?"
        description="Sua sessão neste dispositivo será encerrada e você precisará entrar novamente."
        confirmLabel="Sim, sair"
        pendingLabel="Saindo…"
        variant="destructive"
        pending={pending}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          setPending(true)
          try {
            await signOut()
            setConfirming(false)
            router.replace('/login')
            router.refresh()
          } finally {
            setPending(false)
          }
        }}
      />
    </>
  )
}
