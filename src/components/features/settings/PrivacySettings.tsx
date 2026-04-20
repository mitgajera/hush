'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { Sparkles, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useStorageValue } from '@/hooks/useLocalStorage'
import { settingsStorage } from '@/lib/storage/settings'
import { clearAllLocalData, seedDemoData } from '@/lib/demo/seedData'

const DEFAULTS_FOR_SSR = {
  rpcUrl: 'https://api.devnet.solana.com',
  network: 'devnet' as const,
  hideAmountsByDefault: true,
}

export function PrivacySettings() {
  const wallet = useWallet()
  const settings = useStorageValue(settingsStorage.get, DEFAULTS_FOR_SSR)
  const [clearOpen, setClearOpen] = useState(false)
  const [clearConfirm, setClearConfirm] = useState('')

  function toggleHide() {
    settingsStorage.update({ hideAmountsByDefault: !settings.hideAmountsByDefault })
  }

  function seed() {
    const addr = wallet.publicKey?.toBase58() ?? 'umb1demoxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    seedDemoData(addr)
    toast.success('Demo data seeded.')
  }

  function clearAll() {
    if (clearConfirm !== 'clear') {
      toast.error('Type "clear" to confirm.')
      return
    }
    clearAllLocalData()
    toast.success('Local data cleared.')
    setClearOpen(false)
    setClearConfirm('')
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-fg">Privacy</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Hush keeps every record in this browser only. Nothing leaves your device.
        </p>
      </div>

      {/* Hide by default toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm text-fg">Hide amounts by default</p>
          <p className="text-xs text-fg-muted">
            When off, every amount is revealed until you toggle it individually.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.hideAmountsByDefault}
          onClick={toggleHide}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
            settings.hideAmountsByDefault ? 'bg-accent' : 'bg-bg-elevated'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-bg shadow transition-transform ${
              settings.hideAmountsByDefault ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Demo data */}
      <div className="flex items-start justify-between gap-4 border-t border-border pt-5">
        <div className="space-y-0.5">
          <p className="text-sm text-fg">Seed demo data</p>
          <p className="text-xs text-fg-muted">
            Populate local storage with 3 payroll runs, 3 links, 1 project, and 2 audit
            keys.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          onClick={seed}
        >
          Seed
        </Button>
      </div>

      {/* Destructive clear */}
      <div className="flex items-start justify-between gap-4 border-t border-border pt-5">
        <div className="space-y-0.5">
          <p className="text-sm text-danger">Clear local data</p>
          <p className="text-xs text-fg-muted">
            Removes all payroll runs, links, projects, audit keys, credentials, and
            settings from this browser. Cannot be undone.
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
          onClick={() => setClearOpen(true)}
        >
          Clear
        </Button>
      </div>

      <Dialog
        open={clearOpen}
        onOpenChange={(o) => {
          if (!o) {
            setClearOpen(false)
            setClearConfirm('')
          }
        }}
        title="Clear all local data?"
        description='Type "clear" to confirm. This cannot be undone.'
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setClearOpen(false)
                setClearConfirm('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={clearAll}
              disabled={clearConfirm !== 'clear'}
            >
              I understand, clear it
            </Button>
          </>
        }
      >
        <Input
          autoFocus
          placeholder="clear"
          value={clearConfirm}
          onChange={(e) => setClearConfirm(e.target.value)}
          className="font-mono"
        />
      </Dialog>
    </Card>
  )
}
