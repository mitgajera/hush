'use client'

import { hushLinksStorage } from '@/lib/storage/hushLinks'
import { useStorageList } from './useLocalStorage'

export function useHushLinks() {
  return useStorageList(hushLinksStorage.getAll)
}
