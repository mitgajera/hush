import { STORAGE_EVENT } from './keys'

type Identified = { id: string }

export type ListStorage<T extends Identified> = {
  getAll: () => T[]
  get: (id: string) => T | null
  save: (item: T) => void
  update: (id: string, patch: Partial<T>) => T | null
  delete: (id: string) => void
  clear: () => void
}

export function createListStorage<T extends Identified>(
  storageKey: string
): ListStorage<T> {
  let cache: T[] | null = null

  function load(): T[] {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  function getAll(): T[] {
    if (typeof window === 'undefined') return []
    if (cache === null) cache = load()
    return cache
  }

  function writeAll(items: T[]) {
    cache = items
    localStorage.setItem(storageKey, JSON.stringify(items))
    window.dispatchEvent(new Event(STORAGE_EVENT))
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === storageKey) {
        cache = null
        window.dispatchEvent(new Event(STORAGE_EVENT))
      }
    })
  }

  return {
    getAll,
    get: (id) => getAll().find((r) => r.id === id) ?? null,
    save: (item) => {
      const all = [...getAll()]
      const idx = all.findIndex((r) => r.id === item.id)
      if (idx >= 0) all[idx] = item
      else all.unshift(item)
      writeAll(all)
    },
    update: (id, patch) => {
      const all = [...getAll()]
      const idx = all.findIndex((r) => r.id === id)
      if (idx < 0) return null
      all[idx] = { ...all[idx], ...patch }
      writeAll(all)
      return all[idx]
    },
    delete: (id) => {
      writeAll(getAll().filter((r) => r.id !== id))
    },
    clear: () => {
      writeAll([])
    },
  }
}
