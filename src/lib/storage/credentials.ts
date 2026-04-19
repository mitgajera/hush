import { HushCredential } from '@/types'
import { createListStorage } from './createListStorage'
import { STORAGE_KEYS } from './keys'

export const credentialsStorage = createListStorage<HushCredential>(
  STORAGE_KEYS.credentials
)
