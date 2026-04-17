import { AuditKey } from '@/types'
import { createListStorage } from './createListStorage'
import { STORAGE_KEYS } from './keys'

export const auditKeysStorage = createListStorage<AuditKey>(STORAGE_KEYS.auditKeys)
