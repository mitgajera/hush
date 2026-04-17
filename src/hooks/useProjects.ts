'use client'

import { projectsStorage } from '@/lib/storage/projects'
import { useStorageList } from './useLocalStorage'

export function useProjects() {
  return useStorageList(projectsStorage.getAll)
}
