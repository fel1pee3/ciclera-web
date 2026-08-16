'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useSession } from './session-provider'

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const { signOut } = useSession()
  const [pending, setPending] = useState(false)

  return (
    <Button
      className={className}
      variant="ghost"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await signOut()
        router.replace('/login')
        router.refresh()
      }}
    >
      {pending ? 'Saindo…' : 'Sair'}
    </Button>
  )
}
