'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useUmbra } from '@/hooks/useUmbra'
import { ClaimButton } from '@/components/ClaimButton'
import { PaymentHistory } from '@/components/PaymentHistory'
import { ViewingKeyInput } from '@/components/ViewingKeyInput'
import { ProofOfIncome } from '@/components/ProofOfIncome'
import { truncateAddress } from '@shieldpay/umbra-client'

interface UtxoEntry {
  signatures?: string[]
  timestamp?: string
}

interface ClaimResult {
  claimed: number
  utxos?: unknown[]
}

export default function EmployeePage() {
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { client, loading } = useUmbra()
  const [utxos, setUtxos] = useState<UtxoEntry[]>([])
  const [claimedTotal, setClaimedTotal] = useState(0)
  const [lastClaim, setLastClaim] = useState<string | null>(null)

  function handleClaimed(result: ClaimResult) {
    const newUtxos = (result.utxos ?? []) as UtxoEntry[]
    setUtxos(prev => [...newUtxos, ...prev])
    setClaimedTotal(prev => prev + result.claimed)
    setLastClaim(`${result.claimed} payment${result.claimed === 1 ? '' : 's'} claimed`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px' }}>
            ShieldPay
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: 0 }}>
            Employee portal · devnet
          </p>
        </div>

        {/* Wallet section */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '24px' }}>
          {!connected ? (
            <button
              onClick={() => setVisible(true)}
              style={{ background: 'var(--umbra-primary)', color: '#001a26', border: 'none', borderRadius: 0, fontWeight: 600, padding: '12px 24px', cursor: 'pointer', fontSize: 14 }}
            >
              Connect Wallet
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--text-2)' }}>
                {publicKey ? truncateAddress(publicKey.toBase58()) : ''}
              </span>
              <button
                onClick={() => disconnect()}
                style={{ background: 'transparent', color: 'var(--umbra-primary)', border: '1px solid var(--umbra-primary-bd2)', borderRadius: 0, padding: '6px 14px', cursor: 'pointer', fontSize: 12 }}
              >
                Disconnect
              </button>
            </div>
          )}
          {loading && <p style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: '12px 0 0' }}>Initializing...</p>}
        </div>

        {/* Claim section */}
        {client && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
              Claim payments
            </h2>
            <ClaimButton client={client} onClaimed={handleClaimed} />
            {lastClaim && (
              <p style={{ color: 'var(--umbra-primary)', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: 0 }}>{lastClaim}</p>
            )}
          </div>
        )}

        {/* Payment history */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
            Payment history
          </h2>
          <PaymentHistory utxos={utxos} />
        </div>

        {/* Viewing key */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '24px' }}>
          <ViewingKeyInput />
        </div>

        {/* Proof of income */}
        {connected && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>
              Proof of income
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0 }}>
              Generate a verification document to share with your accountant.
            </p>
            <ProofOfIncome claimedCount={claimedTotal} />
          </div>
        )}
      </div>
    </div>
  )
}
