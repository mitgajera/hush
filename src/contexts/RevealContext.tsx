'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react'
import { settingsStorage } from '@/lib/storage/settings'
import { STORAGE_EVENT } from '@/lib/storage/keys'

type RevealContextValue = {
  globalRevealed: boolean
  toggleGlobal: () => void
  revealedIds: Set<string>
  toggleId: (id: string) => void
  isRevealed: (id: string) => boolean
}

const Ctx = createContext<RevealContextValue | null>(null)

export function RevealProvider({ children }: { children: ReactNode }) {
  // Start hidden during SSR to avoid hydration mismatch; sync to settings after mount.
  const [globalRevealed, setGlobal] = useState(false)
  const [revealedIds, setRevealed] = useState<Set<string>>(new Set())

  // Read the persisted preference once on mount and when the user changes it in Settings.
  useEffect(() => {
    const sync = () => setGlobal(!settingsStorage.get().hideAmountsByDefault)
    sync()
    window.addEventListener(STORAGE_EVENT, sync)
    return () => window.removeEventListener(STORAGE_EVENT, sync)
  }, [])

  const toggleGlobal = useCallback(() => setGlobal((v) => !v), [])
  const toggleId = useCallback((id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const value = useMemo<RevealContextValue>(
    () => ({
      globalRevealed,
      toggleGlobal,
      revealedIds,
      toggleId,
      isRevealed: (id: string) => globalRevealed || revealedIds.has(id),
    }),
    [globalRevealed, revealedIds, toggleGlobal, toggleId]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useReveal() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useReveal must be used within RevealProvider')
  return ctx
}
