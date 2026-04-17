import { HushLink } from '@/types'
import { createListStorage } from './createListStorage'
import { STORAGE_KEYS } from './keys'

export const hushLinksStorage = createListStorage<HushLink>(STORAGE_KEYS.hushLinks)
