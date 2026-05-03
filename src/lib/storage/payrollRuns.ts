import { PayrollRun, PayrollRecipient } from '@/types'
import { createListStorage } from './createListStorage'
import { STORAGE_KEYS } from './keys'

// Migrate stored records that still use the old umbraAddress field name.
function migrateRun(run: PayrollRun): PayrollRun {
  const recipients = run.recipients?.map((r) => {
    const legacy = (r as PayrollRecipient & { umbraAddress?: string }).umbraAddress
    if (!r.walletAddress && legacy) return { ...r, walletAddress: legacy }
    return r
  }) ?? run.recipients
  return { ...run, recipients }
}

const _raw = createListStorage<PayrollRun>(STORAGE_KEYS.payrollRuns)

// Memoize the migrated snapshot so useSyncExternalStore gets a stable reference
// when the underlying raw cache hasn't changed. Without this, .map() always
// creates a new array reference, causing useSyncExternalStore to detect an
// infinite loop and throw "Maximum update depth exceeded".
let _lastRaw: PayrollRun[] | null = null
let _lastMigrated: PayrollRun[] = []

function getAllMigrated(): PayrollRun[] {
  const raw = _raw.getAll()
  if (raw !== _lastRaw) {
    _lastRaw = raw
    _lastMigrated = raw.map(migrateRun)
  }
  return _lastMigrated
}

export const payrollStorage = {
  ..._raw,
  getAll: getAllMigrated,
  get: (id: string) => {
    const run = _raw.get(id)
    return run ? migrateRun(run) : null
  },
}
