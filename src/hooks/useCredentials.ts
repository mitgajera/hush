'use client'

import { credentialsStorage } from '@/lib/storage/credentials'
import { useStorageList } from './useLocalStorage'

export function useCredentials() {
  return useStorageList(credentialsStorage.getAll)
}
