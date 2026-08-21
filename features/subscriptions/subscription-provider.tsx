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

import { getCurrentSubscription } from './api'
import type { CurrentSubscription } from './contracts'

type SubscriptionStatus = 'loading' | 'ready' | 'unavailable'

interface SubscriptionContextValue {
  subscription: CurrentSubscription | null
  status: SubscriptionStatus
  refresh: () => Promise<CurrentSubscription>
  update: (subscription: CurrentSubscription) => void
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(
    null,
  )
  const [status, setStatus] = useState<SubscriptionStatus>('loading')

  const refresh = useCallback(async () => {
    try {
      const current = await getCurrentSubscription()
      setSubscription(current)
      setStatus('ready')
      return current
    } catch (error) {
      setStatus((current) => (current === 'loading' ? 'unavailable' : current))
      throw error
    }
  }, [])

  useEffect(() => {
    let active = true
    void getCurrentSubscription()
      .then((current) => {
        if (!active) return
        setSubscription(current)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('unavailable')
      })
    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({ subscription, status, refresh, update: setSubscription }),
    [refresh, status, subscription],
  )

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription requires SubscriptionProvider.')
  }
  return context
}
