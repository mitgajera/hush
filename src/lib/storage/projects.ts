import { Project } from '@/types'
import { createListStorage } from './createListStorage'
import { STORAGE_KEYS } from './keys'

export const projectsStorage = createListStorage<Project>(STORAGE_KEYS.projects)
