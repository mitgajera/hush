'use client'

import { useState } from 'react'
import { Shell } from '@/components/layout/Shell'
import { PageHeader } from '@/components/layout/PageHeader'
import { WalletGate } from '@/components/wallet/WalletGate'
import { LinkGenerator } from '@/components/features/links/LinkGenerator'
import { LinkDisplay } from '@/components/features/links/LinkDisplay'
import { ActiveLinksTable } from '@/components/features/links/ActiveLinksTable'
import type { HushLink } from '@/types'

function LinksContent() {
  const [generatedLink, setGeneratedLink] = useState<HushLink | null>(null)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hush Links"
        description="Share a private payment link. The recipient claims without revealing an address."
      />

      {generatedLink ? (
        <LinkDisplay
          link={generatedLink}
          onCreateAnother={() => setGeneratedLink(null)}
        />
      ) : (
        <LinkGenerator onGenerated={setGeneratedLink} />
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-fg">All links</h3>
        <ActiveLinksTable />
      </section>
    </div>
  )
}

export default function LinksPage() {
  return (
    <Shell>
      <WalletGate>
        <LinksContent />
      </WalletGate>
    </Shell>
  )
}
