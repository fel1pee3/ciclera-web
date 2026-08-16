'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'

import type { UserRole } from './contracts'
import { roleHome } from './redirects'
import { useSession } from './session-provider'
import {
  AccessDenied,
  SessionLoading,
  SessionUnavailable,
} from './session-states'

interface ProtectedAreaProps {
  allowedRoles: readonly UserRole[]
  children: ReactNode
}

export function ProtectedArea({ allowedRoles, children }: ProtectedAreaProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { account, reload, status } = useSession()
  const roleAllowed = account ? allowedRoles.includes(account.user.role) : false

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`)
    } else if (status === 'authenticated' && account && !roleAllowed) {
      router.replace(
        `/acesso-negado?destino=${encodeURIComponent(roleHome(account.user.role))}`,
      )
    }
  }, [account, pathname, roleAllowed, router, status])

  if (status === 'unavailable') return <SessionUnavailable retry={reload} />
  if (status !== 'authenticated' || !account) return <SessionLoading />
  if (!roleAllowed) return <AccessDenied />

  return children
}
