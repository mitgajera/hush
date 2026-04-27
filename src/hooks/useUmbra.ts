'use client'

import type { getUmbraClient } from '@umbra-privacy/sdk'
export type UmbraClient = Awaited<ReturnType<typeof getUmbraClient>>

import { useUmbraSdkClient } from './useUmbraSdkClient'

export function useUmbra(): UmbraClient | null {
  const sdk = useUmbraSdkClient()
  return sdk.status === 'ready' ? sdk.client : null
}
