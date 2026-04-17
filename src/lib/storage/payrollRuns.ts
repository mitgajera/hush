import { PayrollRun } from '@/types'
import { createListStorage } from './createListStorage'
import { STORAGE_KEYS } from './keys'

export const payrollStorage = createListStorage<PayrollRun>(STORAGE_KEYS.payrollRuns)
