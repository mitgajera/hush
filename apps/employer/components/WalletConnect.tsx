'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useUmbra } from '@/hooks/useUmbra'
import { registerAccount, truncateAddress } from '@shieldpay/umbra-client'
import { useState } from 'react'

export function WalletConnect() {
  const { publicKey, disconnect, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const { client, loading, error } = useUmbra()
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  async function handleRegister() {
    if (!client) return
    setRegistering(true)
    setRegError(null)
    try {
      await registerAccount(client)
      setRegistered(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      // SDK handles "already registered" gracefully
      if (msg.toLowerCase().includes('already')) {
        setRegistered(true)
      } else {
        setRegError(msg)
      }
    } finally {
      setRegistering(false)
    }
  }

  if (!connected) {
    return (
      <button
        onClick={() => setVisible(true)}
        style={{
          background: 'var(--umbra-primary)',
          color: '#001a26',
          border: 'none',
          borderRadius: 0,
          fontWeight: 600,
          padding: '12px 24px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
        }}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>
          {publicKey ? truncateAddress(publicKey.toBase58()) : ''}
        </span>
        <button
          onClick={() => disconnect()}
          style={{
            background: 'transparent',
            color: 'var(--umbra-primary)',
            border: '1px solid var(--umbra-primary-bd2)',
            borderRadius: 0,
            padding: '6px 14px',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Disconnect
        </button>
      </div>

      {loading && <p style={{ color: 'var(--text-2)', fontSize: 12 }}>Initializing Umbra client...</p>}
      {error && <p style={{ color: 'var(--error)', fontSize: 12 }}>Connection error — check your wallet is on devnet</p>}

      {client && !registered && (
        <button
          onClick={handleRegister}
          disabled={registering}
          style={{
            background: 'var(--sp-purple)',
            color: '#fff',
            border: 'none',
            borderRadius: 0,
            padding: '10px 20px',
            cursor: registering ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {registering ? 'Registering on Umbra...' : 'Activate ShieldPay'}
        </button>
      )}

      {registered && (
        <span style={{ color: 'var(--umbra-primary)', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
          Umbra account active
        </span>
      )}

      {regError && (
        <p style={{ color: 'var(--error)', fontSize: 12 }}>
          {regError.includes('network') ? 'Connection error — check your wallet is on devnet' : regError}
        </p>
      )}
    </div>
  )
}
