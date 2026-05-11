'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { toast } from 'sonner'
import { ExternalLink, LogOut, RefreshCcw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { useStorageValue } from '@/hooks/useLocalStorage'
import { settingsStorage } from '@/lib/storage/settings'
import { UMBRA_WALLET_URL } from '@/constants/content'
import type { Network } from '@/types'

const DEFAULTS_FOR_SSR = {
  rpcUrl: 'https://api.devnet.solana.com',
  network: 'devnet' as Network,
  hideAmountsByDefault: true,
}

export function WalletSettings() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const settings = useStorageValue(settingsStorage.get, DEFAULTS_FOR_SSR)
  const [rpcDraft, setRpcDraft] = useState(settings.rpcUrl)
  const [testing, setTesting] = useState(false)

  async function testRpc() {
    setTesting(true)
    try {
      const target = new Connection(rpcDraft || settings.rpcUrl)
      const slot = await target.getSlot()
      toast.success(`RPC reachable. Slot ${slot}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'RPC test failed')
    } finally {
      setTesting(false)
    }
  }

  function saveRpc() {
    if (!rpcDraft.trim()) {
      toast.error('Enter a valid RPC URL.')
      return
    }
    settingsStorage.update({ rpcUrl: rpcDraft.trim() })
    toast.success('RPC URL saved. Reload the app for it to take effect.')
  }

  function setNetwork(value: Network) {
    settingsStorage.update({ network: value })
    toast.info(`Network set to ${value}. Reload the app for it to take effect.`)
  }

  return (
    <Card className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-fg">Wallet</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Network and RPC settings for this browser. Connection is handled by your
          Umbra Wallet extension.
        </p>
      </div>

      {/* Connection */}
      <div className="space-y-2">
        <p className="text-2xs uppercase tracking-wide text-fg-subtle">Connected wallet</p>
        {wallet.connected && wallet.publicKey ? (
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_2px_rgba(74,200,158,0.2)]"
              />
              <TruncatedAddress address={wallet.publicKey.toBase58()} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
              onClick={() => {
                void wallet.disconnect()
                toast.success('Wallet disconnected.')
              }}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <p className="text-sm text-fg-muted">No wallet connected.</p>
        )}
      </div>

      {/* RPC URL */}
      <div className="space-y-2">
        <Input
          label="RPC URL"
          value={rpcDraft}
          onChange={(e) => setRpcDraft(e.target.value)}
          onFocus={(e) => {
            // Reveal full URL on focus so the user can edit it
            const el = e.currentTarget
            el.type = 'text'
          }}
          onBlur={(e) => {
            // Mask API key when not focused
            const el = e.currentTarget
            el.type = rpcDraft.includes('api-key') ? 'password' : 'text'
          }}
          type={rpcDraft.includes('api-key') ? 'password' : 'text'}
          autoComplete="off"
          spellCheck={false}
          className="font-mono text-xs"
          hint={
            settings.rpcUrl !== rpcDraft
              ? 'Unsaved changes.'
              : settings.rpcUrl === '/api/rpc'
              ? 'Using server-side proxy — API key is safe.'
              : `Active: ${connection.rpcEndpoint.replace(/([?&]api-key=)[^&]*/i, '$1***')}`
          }
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCcw className="h-3.5 w-3.5" />}
            onClick={testRpc}
            loading={testing}
          >
            Test connection
          </Button>
          <Button size="sm" onClick={saveRpc} disabled={rpcDraft === settings.rpcUrl}>
            Save
          </Button>
        </div>
      </div>

      {/* Network */}
      <div className="space-y-2">
        <Select
          label="Network"
          value={settings.network}
          onChange={(e) => setNetwork(e.target.value as Network)}
          hint="Reload the app for a network change to take effect."
        >
          <option value="devnet">Devnet</option>
          <option value="mainnet-beta">Mainnet</option>
        </Select>
      </div>

      <a
        href={UMBRA_WALLET_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-accent hover:opacity-80"
      >
        Open Umbra Wallet <ExternalLink className="h-3 w-3" />
      </a>
    </Card>
  )
}
