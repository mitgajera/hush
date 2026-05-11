import { AppSettings } from '@/types'
import { STORAGE_EVENT, STORAGE_KEYS } from './keys'

// Use the server-side proxy so the RPC API key never reaches the browser bundle.
// Users can override this in Settings with their own RPC URL.
const DEFAULTS: AppSettings = {
  rpcUrl: '/api/rpc',
  network: (process.env.NEXT_PUBLIC_SOLANA_NETWORK as AppSettings['network']) || 'devnet',
  hideAmountsByDefault: true,
}

let cache: AppSettings | null = null

function load(): AppSettings {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

function write(value: AppSettings) {
  cache = value
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(value))
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.settings) {
      cache = null
      window.dispatchEvent(new Event(STORAGE_EVENT))
    }
  })
}

export const settingsStorage = {
  get(): AppSettings {
    if (typeof window === 'undefined') return DEFAULTS
    if (cache === null) cache = load()
    return cache
  },
  update(patch: Partial<AppSettings>): AppSettings {
    const next = { ...settingsStorage.get(), ...patch }
    write(next)
    return next
  },
  reset() {
    write(DEFAULTS)
  },
  clear() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.settings)
    cache = null
    window.dispatchEvent(new Event(STORAGE_EVENT))
  },
}
