'use client'

import { auditKeysStorage } from '@/lib/storage/auditKeys'
import { useStorageList } from './useLocalStorage'

export function useAuditKeys() {
  return useStorageList(auditKeysStorage.getAll)
}
