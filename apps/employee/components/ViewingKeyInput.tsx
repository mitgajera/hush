'use client'

import { useState } from 'react'

export function ViewingKeyInput() {
  const [key, setKey] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text')
    setKey(pasted)
    if (pasted.length > 0) setAcknowledged(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label style={{ color: 'var(--text-2)', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
        MONTHLY VIEWING KEY (from employer)
      </label>
      <input
        type="text"
        value={key}
        onChange={e => setKey(e.target.value)}
        onPaste={handlePaste}
        placeholder="Paste hex viewing key..."
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--bd2)',
          borderRadius: 0,
          padding: '10px 14px',
          color: 'var(--text-1)',
          fontFamily: 'Space Mono, monospace',
          fontSize: 12,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box' as const,
        }}
      />
      {acknowledged && (
        <div style={{ background: 'var(--umbra-primary-bg)', border: '1px solid var(--umbra-primary-bd)', padding: '12px 16px' }}>
          <p style={{ color: 'var(--umbra-primary)', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: 0 }}>
            Viewing key received. Full decryption is available via the ShieldPay compliance dashboard — share this key with your accountant for income verification.
          </p>
        </div>
      )}
    </div>
  )
}
