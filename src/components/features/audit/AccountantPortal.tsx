'use client'

import { useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Lock, Unlock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PrivateBadge } from '@/components/ui/PrivateBadge'
import { Textarea } from '@/components/ui/Textarea'
import { DecryptedRecordsTable } from './DecryptedRecordsTable'
import { createUmbraClient } from '@/lib/umbra/client'
import { decryptWithViewingKey } from '@/lib/umbra/viewingKey'
import { auditKeysStorage } from '@/lib/storage/auditKeys'
import type { DecryptedTransfer } from '@/lib/umbra/types'

export function AccountantPortal({ initialKey }: { initialKey: string }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [key, setKey] = useState<string>(initialKey)
  const [records, setRecords] = useState<DecryptedTransfer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [scope, setScope] = useState<string>('Hush audit')

  // Auto-decrypt if a key was passed in the URL
  useEffect(() => {
    if (initialKey && initialKey.startsWith('vk_')) {
      void decrypt(initialKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey])

  async function decrypt(candidate?: string) {
    const input = (candidate ?? key).trim()
    if (!input) {
      setError('Paste an audit key to decrypt.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const client = createUmbraClient(wallet, connection)
      const result = await decryptWithViewingKey(client, input)
      setRecords(result)
      const stored = auditKeysStorage.getAll().find((k) => k.key === input)
      setScope(stored?.scopeDescription ?? 'Hush audit')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired key')
      setRecords(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_2px_rgba(74,200,158,0.2)]"
            />
            <div>
              <p className="text-sm font-medium text-fg">hush.</p>
              <p className="text-2xs text-fg-subtle">Audit</p>
            </div>
          </div>
          <PrivateBadge />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
        <section className="space-y-2">
          <h1 className="text-xl font-medium text-fg">Audit access</h1>
          <p className="text-sm text-fg-muted">
            Paste the audit key you received to decrypt the in-scope records. No wallet
            required — this view is read-only.
          </p>
        </section>

        <section className="space-y-3">
          <Textarea
            label="Audit key"
            rows={3}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="vk_…"
            error={error ?? undefined}
            className="font-mono text-xs"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-fg-subtle">
              {records === null ? (
                <span className="inline-flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Records are hidden until decrypted.
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-success">
                  <Unlock className="h-3 w-3" /> Decrypted · {records.length} records
                </span>
              )}
            </p>
            <Button onClick={() => decrypt()} loading={loading}>
              Decrypt records
            </Button>
          </div>
        </section>

        {records !== null && (
          <DecryptedRecordsTable records={records} scope={scope} />
        )}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-center text-2xs text-fg-subtle">
        Generated via Hush Audit · Powered by Umbra
      </footer>
    </div>
  )
}
