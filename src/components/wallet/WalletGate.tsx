'use client'

import { ReactNode } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { NotConnectedState } from './NotConnectedState'

export function WalletGate({ children }: { children: ReactNode }) {
  const { connected } = useWallet()
  if (!connected) return <NotConnectedState />
  return <>{children}</>
}
