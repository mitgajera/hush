'use client'

import { ExternalLink, Github } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PrivateBadge } from '@/components/ui/PrivateBadge'
import { COPY, HUSH_GITHUB_URL, UMBRA_DOCS_URL } from '@/constants/content'

const APP_VERSION = '0.1.0'
const UMBRA_SDK_VERSION = 'stub (0.0.0-dev)'

export function AboutPanel() {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-fg">About</h3>
          <p className="mt-1 text-xs text-fg-muted">{COPY.tagline}</p>
        </div>
        <PrivateBadge />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-0.5">
          <dt className="text-fg-subtle uppercase tracking-wide">Hush version</dt>
          <dd className="font-mono text-fg">{APP_VERSION}</dd>
        </div>
        <div className="space-y-0.5">
          <dt className="text-fg-subtle uppercase tracking-wide">Umbra SDK</dt>
          <dd className="font-mono text-fg">{UMBRA_SDK_VERSION}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <a
          href={HUSH_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary h-8 text-xs"
        >
          <Github className="h-3.5 w-3.5" />
          View on GitHub
        </a>
        <a
          href={UMBRA_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary h-8 text-xs"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Umbra docs
        </a>
      </div>

      <div className="rounded-md border border-border bg-bg-elevated p-3 text-xs text-fg-muted">
        <p className="text-fg">Powered by Umbra</p>
        <p className="mt-1">{COPY.poweredBy}</p>
        <p className="mt-3 text-2xs text-fg-subtle">
          Umbra is a privacy layer for Web3, enabling shielded transactions.
        </p>
      </div>
    </Card>
  )
}
