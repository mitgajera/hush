'use client'

import { useSyncExternalStore } from 'react'
import { STORAGE_EVENT } from '@/lib/storage/keys'

function subscribe(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(STORAGE_EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(STORAGE_EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

const EMPTY: readonly unknown[] = Object.freeze([])

export function useStorageList<T>(getAll: () => T[]): T[] {
  return useSyncExternalStore(
    subscribe,
    getAll,
    () => EMPTY as unknown as T[]
  )
}

export function useStorageValue<T>(get: () => T, ssrFallback: T): T {
  return useSyncExternalStore(subscribe, get, () => ssrFallback)
}
