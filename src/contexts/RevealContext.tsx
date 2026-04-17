'use client'

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react'

type RevealContextValue = {
  globalRevealed: boolean
  toggleGlobal: () => void
  revealedIds: Set<string>
  toggleId: (id: string) => void
  isRevealed: (id: string) => boolean
}

const Ctx = createContext<RevealContextValue | null>(null)

export function RevealProvider({ children }: { children: ReactNode }) {
  const [globalRevealed, setGlobal] = useState(false)
  const [revealedIds, setRevealed] = useState<Set<string>>(new Set())

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
