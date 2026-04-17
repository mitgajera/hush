'use client'

import { payrollStorage } from '@/lib/storage/payrollRuns'
import { useStorageList } from './useLocalStorage'

export function usePayrollRuns() {
  return useStorageList(payrollStorage.getAll)
}
