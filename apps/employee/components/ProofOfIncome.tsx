'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'

interface Props {
  claimedCount: number
}

export function ProofOfIncome({ claimedCount }: Props) {
  const { publicKey } = useWallet()
  const [downloading, setDownloading] = useState(false)

  function handleDownload() {
    if (!publicKey) return
    setDownloading(true)

    const proof = {
      type: 'ShieldPay Income Verification',
      wallet: publicKey.toBase58(),
      network: process.env.NEXT_PUBLIC_UMBRA_NETWORK ?? 'devnet',
      claimedUtxos: claimedCount,
      verificationNote: "Verify via ShieldPay compliance dashboard using the employer's monthly viewing key",
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'income-proof.json'
    a.click()
    URL.revokeObjectURL(url)
    setDownloading(false)
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={!publicKey || downloading}
        style={{
          background: 'transparent',
          color: 'var(--umbra-primary)',
          border: '1px solid var(--umbra-primary-bd2)',
          borderRadius: 0,
          padding: '12px 24px',
          cursor: !publicKey ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Download Income Proof
      </button>
    </div>
  )
}
