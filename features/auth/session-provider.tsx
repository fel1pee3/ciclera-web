'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { ApiError } from '@/lib/api/errors'
import { getCurrentAccount, logout } from './api'
import type { AuthenticatedAccount } from './contracts'

type SessionStatus =
  'loading' | 'authenticated' | 'unauthenticated' | 'unavailable'

interface SessionContextValue {
  account: AuthenticatedAccount | null
  status: SessionStatus
  reload: () => Promise<void>
  signOut: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AuthenticatedAccount | null>(null)
  const [status, setStatus] = useState<SessionStatus>('loading')

  const reload = useCallback(async () => {
    setStatus('loading')
    try {
      setAccount(await getCurrentAccount())
      setStatus('authenticated')
    } catch (error) {
      setAccount(null)
      setStatus(
        error instanceof ApiError && error.status === 401
          ? 'unauthenticated'
          : 'unavailable',
      )
    }
  }, [])

  useEffect(() => {
    let active = true

    void getCurrentAccount()
      .then((currentAccount) => {
        if (!active) return
        setAccount(currentAccount)
        setStatus('authenticated')
      })
      .catch((error: unknown) => {
        if (!active) return
        setAccount(null)
        setStatus(
          error instanceof ApiError && error.status === 401
            ? 'unauthenticated'
            : 'unavailable',
        )
      })

    return () => {
      active = false
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } finally {
      setAccount(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo(
    () => ({ account, status, reload, signOut }),
    [account, status, reload, signOut],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession requires SessionProvider.')
  return session
}
