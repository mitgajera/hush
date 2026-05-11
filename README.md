# Hush — Private financial operations for Solana

Every Solana payment is public. Hush changes that.

Built on Umbra. Private by default. Auditable on demand.

**Live demo**: https://hushfi.vercel.app (Solana devnet)

## The problem
Every salary, invoice, and contractor payment on Solana is publicly
visible. Competitors track your team. Employees see each other's rates.
Attackers know your runway.

## What Hush does
Hush is an Umbra-native financial operations platform. It lets
businesses pay employees, contractors, and vendors privately —
amounts encrypted, recipients unlinked, compliance preserved through
viewing keys.

## Features
- **Hush Payroll**: CSV upload, batch private transfers
- **Hush Links**: shareable private payment links
- **Hush Milestones**: project-based payments to contractors
- **Hush Audit**: selective disclosure for accountants via viewing keys
- **Hush Credential**: non-revealing reputation cNFT for payment recipients

## Umbra SDK usage
| Feature | Primitive used |
|---|---|
| Payroll | `sendConfidentialTransfer` |
| Links | `generatePaymentLink` |
| Audit | `generateViewingKey` + `decryptWithViewingKey` |
| Balances | delegated to Umbra Wallet |
| Credential | viewing key attestation + Bubblegum cNFT |

## Umbra Wallet integration
Hush treats Umbra Wallet as its primary UX layer. Key management,
private balance display, and payment history are handled by the
wallet — not reinvented in the app. Hush is the business logic layer
on top.

## Running locally
```bash
git clone https://github.com/mitgajera/hush
cd hush
pnpm install
cp .env.example .env.local
pnpm dev
```

## Build
pnpm build && pnpm start

## Architecture

**Stack**: Next.js 14 (App Router) + TypeScript strict + Tailwind + Radix
primitives + `@solana/wallet-adapter` + Umbra SDK + Metaplex Bubblegum for
cNFTs. No backend — every record lives in `localStorage`, every private
transfer lives on-chain.

**Umbra adapter layer** — every SDK call routes through `src/lib/umbra/*`.
Each function (`sendConfidentialTransfer`, `generatePaymentLink`,
`generateViewingKey`, `decryptWithViewingKey`, `getPrivateBalance`,
`claimPaymentLink`, `inspectPaymentLink`) has a working dev stub with the
same signature as the real SDK, so the whole UI is demoable before the real
SDK is wired. Swapping to real is a body-only change per file.

**State** — typed records (`PayrollRun`, `HushLink`, `Project`, `AuditKey`,
`HushCredential`, `AppSettings`) persist through small list-storage modules
in `src/lib/storage/*`. A single `useSyncExternalStore`-backed hook family
(`usePayrollRuns`, `useHushLinks`, `useProjects`, `useAuditKeys`,
`useCredentials`) drives live UI updates + cross-tab sync via a shared
`hush:storage` event.

**UI primitives** in `src/components/ui/*` — `MaskedAmount`,
`TruncatedAddress`, `Button`, `Dialog`, `Dropdown`, `Tooltip`, `Table`,
`StatusPill`, `PrivateBadge`, `QRCode`, `CopyButton`. `RevealContext`
controls per-instance and global amount masking.

```
src/
├── app/                      # routes (dashboard, payroll, links, claim,
│                             #   milestones, audit, credential, settings)
├── components/
│   ├── ui/                   # primitives (MaskedAmount, TruncatedAddress …)
│   ├── layout/               # Shell, Sidebar, TopBar, NetworkPill
│   ├── wallet/               # WalletConnectButton, WalletGate, StatusPanel
│   └── features/             # feature components, grouped by domain
├── lib/
│   ├── umbra/                # SDK adapter (stubbed for now)
│   ├── cnft/                 # Bubblegum mint + metadata builder
│   ├── storage/              # localStorage modules
│   ├── utils/                # format, csv, validation, cn, download
│   ├── pdf/                  # jsPDF audit report builder
│   └── demo/                 # seed + clear utilities
├── hooks/                    # storage + wallet hooks
├── contexts/                 # RevealContext
├── types/                    # domain types
└── constants/                # navigation, content, tokens
```

**Data flow per feature**
- *Payroll*: CSV or manual entry → zod-validated `DraftRecipient[]` → create
  `PayrollRun` in storage → runner calls `sendConfidentialTransfer` per row,
  updating storage on each transition → modal subscribes and renders live.
- *Links*: form → `generatePaymentLink` → `HushLink` saved locally →
  standalone `/claim/[linkId]` resolves status via local storage first, then
  `inspectPaymentLink` → on claim, local record flips to `claimed` with
  tx sig.
- *Audit*: scope picker → `generateViewingKey` → secure link
  (`/audit?key=`) → accountant-mode route auto-decrypts via
  `decryptWithViewingKey` → sortable table + CSV/PDF export.
- *Milestones*: per-milestone approval fires a confidential transfer +
  generates a Hush link for the contractor in one flow.
- *Credential*: post-claim CTA → `mintHushCredential` via UMI/Bubblegum
  (real when `NEXT_PUBLIC_HUSH_COLLECTION` + `NEXT_PUBLIC_HUSH_TREE` are
  set, stub otherwise) → cNFT minted under a pre-created collection →
  public viewer at `/credential/[id]`.

## Devnet addresses
- USDC mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
- Hush collection: <filled at deploy time>
