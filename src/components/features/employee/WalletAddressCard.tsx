'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'

export function WalletAddressCard({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    if (!showQr || qrSrc) return
    import('qrcode').then((QRCode) =>
      QRCode.toDataURL(address, { width: 220, margin: 2, color: { dark: '#e2e8f0', light: '#0f172a' } })
    ).then(setQrSrc).catch(() => null)
  }, [showQr, address, qrSrc])

  async function copy() {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success('Address copied')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">Your wallet address</p>
        <p className="mt-1 text-xs text-fg-muted">Share this with your employer so they can add you to payroll.</p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2.5">
        <span className="flex-1 truncate font-mono text-xs text-fg">{address}</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : 'Copy address'}
          className="shrink-0 rounded p-1 text-fg-subtle hover:bg-bg-elevated hover:text-fg"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          aria-label="Show QR code"
          className={`shrink-0 rounded p-1 text-fg-subtle hover:bg-bg-elevated hover:text-fg ${showQr ? 'text-accent' : ''}`}
        >
          <QrCode className="h-4 w-4" />
        </button>
      </div>

      {showQr && (
        <div className="flex justify-center pt-1">
          {qrSrc ? (
            <img src={qrSrc} alt="Wallet address QR code" className="h-44 w-44 rounded-lg" />
          ) : (
            <div className="flex h-44 w-44 items-center justify-center rounded-lg bg-bg-elevated text-xs text-fg-muted">
              Generating…
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
