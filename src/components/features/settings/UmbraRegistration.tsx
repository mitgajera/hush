'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useUmbraSdkClient } from '@/hooks/useUmbraSdkClient'
import {
  queryRegistrationStatus,
  registerUser,
  type RegistrationStatus,
} from '@/lib/umbra/registration'

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; value: RegistrationStatus }
  | { status: 'error'; error: Error }

const LABEL: Record<RegistrationStatus['state'], string> = {
  not_registered: 'Not registered',
  x25519_only: 'Registered',
  commitment_only: 'Partial · commitment only',
  registered: 'Registered',
}

export function UmbraRegistration() {
  const sdk = useUmbraSdkClient()
  const [status, setStatus] = useState<FetchState>({ status: 'idle' })
  const [registering, setRegistering] = useState(false)

  async function refresh() {
    if (sdk.status !== 'ready') return
    setStatus({ status: 'loading' })
    try {
      const value = await queryRegistrationStatus(sdk.client)
      setStatus({ status: 'ready', value })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to read status')
      setStatus({ status: 'error', error })
    }
  }

  useEffect(() => {
    if (sdk.status === 'ready') void refresh()
    else setStatus({ status: 'idle' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk.status])

  async function register() {
    if (sdk.status !== 'ready') return
    setRegistering(true)
    try {
      const sigs = await registerUser(sdk.client)
      toast.success(
        sigs.length === 0
          ? 'Already registered.'
          : `Registered in ${sigs.length} step${sigs.length === 1 ? '' : 's'}.`
      )
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const isRegistered =
    status.status === 'ready' &&
    (status.value.state === 'registered' || status.value.state === 'x25519_only')

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-fg">Umbra registration</h3>
        <p className="mt-1 text-xs text-fg-muted">
          Register on-chain to unlock encrypted balances and private transfers. This is
          a one-time setup that publishes your X25519 encryption key and user
          commitment.
        </p>
      </div>

      {sdk.status === 'idle' && (
        <p className="text-xs text-fg-subtle">Connect a wallet to see status.</p>
      )}

      {sdk.status === 'loading' && (
        <p className="inline-flex items-center gap-1 text-xs text-fg-muted">
          <Loader2 className="h-3 w-3 animate-spin" /> Initializing client…
        </p>
      )}

      {sdk.status === 'error' && (
        <p className="inline-flex items-center gap-1 text-xs text-danger">
          <AlertTriangle className="h-3 w-3" /> {sdk.error.message}
        </p>
      )}

      {sdk.status === 'ready' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2">
              {status.status === 'ready' && isRegistered ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : status.status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin text-fg-muted" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-fg-muted" />
              )}
              <span
                className={
                  isRegistered ? 'text-success' : 'text-fg'
                }
              >
                {status.status === 'ready'
                  ? LABEL[status.value.state]
                  : status.status === 'loading'
                  ? 'Checking…'
                  : status.status === 'error'
                  ? 'Unable to read status'
                  : '—'}
              </span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => void refresh()}>
              Refresh
            </Button>
          </div>

          {status.status === 'error' && (
            <p className="text-2xs text-danger">{status.error.message}</p>
          )}

          {!isRegistered && (
            <Button
              onClick={register}
              loading={registering}
              disabled={status.status !== 'ready'}
            >
              Register with Umbra
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
