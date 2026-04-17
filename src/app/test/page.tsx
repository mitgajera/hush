'use client'

import { RevealProvider, useReveal } from '@/contexts/RevealContext'
import { MaskedAmount } from '@/components/ui/MaskedAmount'
import { TruncatedAddress } from '@/components/ui/TruncatedAddress'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Progress } from '@/components/ui/Progress'
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table'
import { CopyButton } from '@/components/ui/CopyButton'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusPill } from '@/components/ui/StatusPill'
import { LockIcon } from '@/components/ui/LockIcon'
import { PrivateBadge } from '@/components/ui/PrivateBadge'
import { QRCode } from '@/components/ui/QRCode'
import { Dialog } from '@/components/ui/Dialog'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { Tooltip } from '@/components/ui/Tooltip'
import { useState } from 'react'

const SAMPLE_ADDR = 'umb1ax92kq0wnldxp8f73r2d4s5t6y7u8i9o0pzvbnmq4k2x'

function GlobalRevealToggle() {
  const { globalRevealed, toggleGlobal } = useReveal()
  return (
    <Button variant="secondary" size="sm" onClick={toggleGlobal}>
      {globalRevealed ? 'Hide all' : 'Reveal all'}
    </Button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{title}</h2>
      {children}
    </section>
  )
}

export default function TestPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <RevealProvider>
      <main className="mx-auto max-w-3xl space-y-10 p-8">
        <header className="space-y-1">
          <h1 className="text-xl font-medium text-fg">Phase 1 primitives</h1>
          <p className="text-sm text-fg-muted">
            Temporary bench for MaskedAmount, TruncatedAddress, and UI primitives.
          </p>
        </header>

        <Section title="MaskedAmount">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Global toggle</span>
              <GlobalRevealToggle />
            </div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 text-sm">
              <span className="text-fg-muted">Small amount</span>
              <MaskedAmount id="mask-small" amount={42.5} />
              <span className="text-fg-muted">Medium amount</span>
              <MaskedAmount id="mask-medium" amount={1250.0} />
              <span className="text-fg-muted">Large amount</span>
              <MaskedAmount id="mask-large" amount={18_450.75} />
              <span className="text-fg-muted">Blocks mask</span>
              <MaskedAmount id="mask-blocks" amount={3200} maskStyle="blocks" />
              <span className="text-fg-muted">No toggle</span>
              <MaskedAmount id="mask-no-toggle" amount={999} showToggle={false} />
            </div>
          </Card>
        </Section>

        <Section title="TruncatedAddress">
          <Card className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-fg-muted w-32">Default</span>
              <TruncatedAddress address={SAMPLE_ADDR} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-fg-muted w-32">4/4</span>
              <TruncatedAddress address={SAMPLE_ADDR} prefixLen={4} suffixLen={4} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-fg-muted w-32">No copy</span>
              <TruncatedAddress address={SAMPLE_ADDR} showCopy={false} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-fg-muted w-32">Not monospace</span>
              <TruncatedAddress address={SAMPLE_ADDR} monospace={false} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-fg-muted w-32">Short (no truncate)</span>
              <TruncatedAddress address="umb1abc" />
            </div>
          </Card>
        </Section>

        <Section title="Buttons">
          <Card className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </Card>
        </Section>

        <Section title="Inputs">
          <Card className="space-y-3">
            <Input label="Label" placeholder="Type here" hint="Hint text below" />
            <Input label="With error" defaultValue="oops" error="Invalid value" />
            <Textarea label="Textarea" placeholder="Long text" />
            <Select label="Select">
              <option>Option A</option>
              <option>Option B</option>
            </Select>
          </Card>
        </Section>

        <Section title="Badges + status">
          <Card className="flex flex-wrap items-center gap-2">
            <Badge>Neutral</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="accent">Accent</Badge>
            <StatusPill status="pending" />
            <StatusPill status="completed" />
            <StatusPill status="failed" />
            <StatusPill status="claimed" />
            <StatusPill status="draft" />
            <PrivateBadge />
            <LockIcon state="active" />
            <LockIcon state="pending" />
            <LockIcon state="failed" />
          </Card>
        </Section>

        <Section title="Table">
          <Table>
            <Thead>
              <tr>
                <Th>Recipient</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <TruncatedAddress address={SAMPLE_ADDR} />
                </Td>
                <Td>
                  <MaskedAmount id="row-1" amount={500} />
                </Td>
                <Td>
                  <StatusPill status="pending" />
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <TruncatedAddress address={SAMPLE_ADDR} />
                </Td>
                <Td>
                  <MaskedAmount id="row-2" amount={1200} />
                </Td>
                <Td>
                  <StatusPill status="completed" />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Section>

        <Section title="Progress + Skeleton">
          <Card className="space-y-3">
            <Progress value={30} />
            <Progress value={70} />
            <div className="flex gap-3">
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={16} />
            </div>
          </Card>
        </Section>

        <Section title="CopyButton + QR">
          <Card className="flex flex-wrap items-center gap-4">
            <CopyButton value="umb1...example" label="Copy address" />
            <CopyButton value="https://hush.dev" iconOnly />
            <QRCode value="https://hush.dev/claim/abc" size={120} />
          </Card>
        </Section>

        <Section title="Dialog + Dropdown + Tooltip">
          <Card className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Open dialog
            </Button>
            <Dialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              title="Hello from dialog"
              description="This is a temporary test dialog."
              footer={
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              }
            />
            <Dropdown trigger={<Button variant="secondary">Menu</Button>}>
              <DropdownItem onSelect={() => undefined}>Item one</DropdownItem>
              <DropdownItem onSelect={() => undefined}>Item two</DropdownItem>
              <DropdownSeparator />
              <DropdownItem destructive onSelect={() => undefined}>
                Delete
              </DropdownItem>
            </Dropdown>
            <Tooltip content="Tooltip content">
              <Button variant="ghost">Hover me</Button>
            </Tooltip>
          </Card>
        </Section>

        <Section title="EmptyState">
          <EmptyState
            title="Nothing here yet"
            description="Wire the real data in later phases. This is just the primitive."
            action={<Button>Do a thing</Button>}
          />
        </Section>
      </main>
    </RevealProvider>
  )
}
