'use client'

import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { getCurrentAccount } from './api'
import { roleHome } from './redirects'

export function PublicAuthRoute({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true

    void getCurrentAccount()
      .then((account) => {
        if (!active) return
        router.replace(roleHome(account.user.role))
        router.refresh()
      })
      .catch(() => {
        if (active) setChecking(false)
      })

    return () => {
      active = false
    }
  }, [router])

  if (!checking) return children

  return (
    <div
      className="grid min-h-52 place-items-center text-center"
      role="status"
      aria-live="polite"
    >
      <div>
        <LoaderCircle
          className="mx-auto size-6 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          Preparando seu acesso…
        </p>
      </div>
    </div>
  )
}
