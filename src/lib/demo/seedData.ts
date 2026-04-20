import { nanoid } from 'nanoid'
import type {
  AuditKey,
  HushLink,
  Milestone,
  Network,
  PayrollRecipient,
  PayrollRun,
  Project,
} from '@/types'
import { payrollStorage } from '@/lib/storage/payrollRuns'
import { hushLinksStorage } from '@/lib/storage/hushLinks'
import { projectsStorage } from '@/lib/storage/projects'
import { auditKeysStorage } from '@/lib/storage/auditKeys'

const FAKE_ADDRS = [
  'umb1qy2kxd8k3jrh9w4mn5p7vlz2c6fx8brqhjnkm4a2qw0',
  'umb1a7sd92kfn3l5b6vc0x4mn8pqr7tyz2hjk9wldpxbcf1',
  'umb1p5r8tm4k2jnx9v3q7cfhwzb6d8l0yseawoiq2nmpkj4',
  'umb1kx7fz9d3qm2nb5vp8rhtwlcjy4a6s0uieg1xoqkmnhp',
  'umb1bxn4m8k2wjhrzqp9vctfld6y3s0a5ue7igkqoxmnpwh',
]

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

function addr(i: number): string {
  return FAKE_ADDRS[i % FAKE_ADDRS.length]
}

function makeRun(
  index: number,
  daysAgo: number,
  amounts: Array<{ name: string; amount: number }>,
  network: Network,
  sender: string
): PayrollRun {
  const createdAt = daysAgoIso(daysAgo)
  const completedAt = daysAgoIso(daysAgo - 0.02)
  const recipients: PayrollRecipient[] = amounts.map((a, i) => ({
    id: 'rec_' + nanoid(8),
    name: a.name,
    umbraAddress: addr(index * 10 + i),
    amountUsdc: a.amount,
    status: 'success',
    txSignature: 'demo_' + nanoid(24),
  }))
  return {
    id: 'run_' + nanoid(10),
    createdAt,
    completedAt,
    recipients,
    totalUsdc: amounts.reduce((s, a) => s + a.amount, 0),
    status: 'completed',
    network,
    senderAddress: sender,
  }
}

function makeLink(
  status: HushLink['status'],
  amount: number,
  description: string,
  daysAgo: number,
  network: Network,
  sender: string
): HushLink {
  const token = nanoid(22)
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const createdAt = daysAgoIso(daysAgo)
  return {
    id: 'link_' + nanoid(12),
    linkToken: token,
    url: `${base}/claim/${token}`,
    amountUsdc: amount,
    description,
    createdAt,
    expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    status,
    claimedAt: status === 'claimed' ? daysAgoIso(daysAgo - 0.3) : undefined,
    claimTxSignature: status === 'claimed' ? 'demo_claim_' + nanoid(20) : undefined,
    network,
    senderAddress: sender,
  }
}

function makeProject(network: Network, sender: string): Project {
  const createdAt = daysAgoIso(12)
  const paid: Milestone = {
    id: 'ms_' + nanoid(8),
    number: 1,
    description: 'Design review and discovery',
    amountUsdc: 1200,
    status: 'paid',
    approvedAt: daysAgoIso(10),
    paidAt: daysAgoIso(10),
    txSignature: 'demo_' + nanoid(24),
  }
  const pending1: Milestone = {
    id: 'ms_' + nanoid(8),
    number: 2,
    description: 'Implementation sprint 1',
    amountUsdc: 2500,
    status: 'pending',
  }
  const pending2: Milestone = {
    id: 'ms_' + nanoid(8),
    number: 3,
    description: 'Implementation sprint 2',
    amountUsdc: 2500,
    status: 'pending',
  }
  const milestones = [paid, pending1, pending2]
  return {
    id: 'prj_' + nanoid(10),
    name: 'Q2 brand refresh',
    clientDescription: 'Logo, typography, and marketing site refresh.',
    contractorAddress: addr(7),
    createdAt,
    status: 'active',
    milestones,
    totalBudgetUsdc: milestones.reduce((s, m) => s + m.amountUsdc, 0),
  }
}

function makeAuditKeys(runs: PayrollRun[]): AuditKey[] {
  if (runs.length === 0) return []
  return [
    {
      id: 'key_' + nanoid(10),
      key: 'vk_' + nanoid(48),
      scope: { type: 'all' },
      scopeDescription: 'All payments',
      createdAt: daysAgoIso(2),
      lastUsedAt: daysAgoIso(1),
    },
    {
      id: 'key_' + nanoid(10),
      key: 'vk_' + nanoid(48),
      scope: { type: 'run', runId: runs[0].id },
      scopeDescription: `Payroll ${runs[0].id.slice(0, 12)}… · ${runs[0].recipients.length} recipients`,
      createdAt: daysAgoIso(3),
    },
  ]
}

export function seedDemoData(senderAddress: string) {
  const network =
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Network | undefined) ?? 'devnet'

  const runs: PayrollRun[] = [
    makeRun(
      0,
      28,
      [
        { name: 'Alice Nguyen', amount: 4500 },
        { name: 'Bahar Ozturk', amount: 3800 },
        { name: 'Caleb Reyes', amount: 5200 },
      ],
      network,
      senderAddress
    ),
    makeRun(
      1,
      15,
      [
        { name: 'Alice Nguyen', amount: 4500 },
        { name: 'Bahar Ozturk', amount: 3800 },
        { name: 'Caleb Reyes', amount: 5200 },
        { name: 'Dev Patel', amount: 2400 },
      ],
      network,
      senderAddress
    ),
    makeRun(
      2,
      2,
      [
        { name: 'Alice Nguyen', amount: 4600 },
        { name: 'Bahar Ozturk', amount: 3800 },
      ],
      network,
      senderAddress
    ),
  ]

  const links: HushLink[] = [
    makeLink('active', 250, 'Invoice #144', 1, network, senderAddress),
    makeLink('active', 1800, 'Consulting retainer', 4, network, senderAddress),
    makeLink('claimed', 950, 'Refund · order #1822', 6, network, senderAddress),
  ]

  const project = makeProject(network, senderAddress)

  runs.forEach((r) => payrollStorage.save(r))
  links.forEach((l) => hushLinksStorage.save(l))
  projectsStorage.save(project)

  const keys = makeAuditKeys(runs)
  keys.forEach((k) => auditKeysStorage.save(k))
}

export function clearAllLocalData() {
  payrollStorage.clear()
  hushLinksStorage.clear()
  projectsStorage.clear()
  auditKeysStorage.clear()
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('hush:credentials:v1')
    window.localStorage.removeItem('hush:settings:v1')
    window.dispatchEvent(new Event('hush:storage'))
  }
}
