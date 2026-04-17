# Hush — Complete Build Specification

> **For Claude Code**: This is the complete end-to-end specification for building Hush. Follow the build order in Section 18. Build one feature completely before moving to the next. Every file path, data model, component, and interaction is specified below. When the Umbra SDK API is uncertain, use the adapter pattern in Section 10 — all SDK calls go through one file so they can be swapped when real API is known.

---

## 1. Product Overview

**Hush** is an Umbra-native financial operations platform for Solana. It lets businesses pay employees, contractors, and vendors privately — amounts encrypted, recipients unlinked, compliance preserved through viewing keys.

**One-line positioning**: *"Every Solana payment is public. Hush changes that."*

**Core primitives used from Umbra SDK:**
1. `sendConfidentialTransfer` — amount + recipient encrypted on-chain
2. `generatePaymentLink` — share a link, recipient claims without revealing address
3. `generateViewingKey` + `decryptWithViewingKey` — selective disclosure for accountants
4. Private balance reads (delegated to Umbra Wallet UI)

**Non-goals** (explicitly out of scope for this build):
- Custom key management (Umbra Wallet handles it)
- Building a private balance display (Umbra Wallet shows it)
- Backend database (everything is localStorage + on-chain)
- Multi-tenant infrastructure (single-wallet app for hackathon)
- Real viewing-key cryptography validation (trust SDK)

---

## 2. Tech Stack — Exact Choices

| Layer | Choice | Version | Why |
|---|---|---|---|
| Framework | Next.js | `14.2.x` | App Router, SSR/SSG flexibility, Vercel-native |
| Language | TypeScript | `5.x` | Strict mode on |
| React | React | `18.x` | App Router requirement |
| Styling | Tailwind CSS | `3.4.x` | Speed + consistency |
| UI primitives | Radix UI | latest | Dialog, Dropdown, Tooltip only |
| Icons | lucide-react | `0.400+` | Consistent, tree-shakeable |
| Wallet | `@solana/wallet-adapter-react` | latest | Standard Solana wallet flow |
| Wallet UIs | `@solana/wallet-adapter-wallets` | latest | Phantom, Backpack, Solflare adapters |
| Solana | `@solana/web3.js` | `1.95+` | RPC + primitives |
| Privacy | `@umbra/sdk` | latest | **Abstract behind adapter in Section 10** |
| cNFT | `@metaplex-foundation/mpl-bubblegum` | latest | Compressed NFT for credentials |
| UMI | `@metaplex-foundation/umi-bundle-defaults` | latest | cNFT signer helpers |
| CSV | `papaparse` | `5.x` | CSV parse/generate |
| Validation | `zod` | `3.x` | Form schemas, type-safe |
| IDs | `nanoid` | `5.x` | Local run IDs, link IDs |
| Dates | `date-fns` | `3.x` | Relative time, formatting |
| PDF | `jspdf` + `jspdf-autotable` | latest | Hush Audit PDF export |
| Toast | `sonner` | `1.x` | Clean, headless toast system |
| State | React Context + `useSyncExternalStore` | — | No Zustand — keep it light |
| Deploy | Vercel | — | Zero-config Next.js |

**Node**: v20.x
**Package manager**: `pnpm` preferred, `npm` also fine.

---

## 3. Project Structure

```
hush/
├── .env.local                    # not committed
├── .env.example                  # committed
├── .gitignore
├── README.md
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   └── favicon.ico
└── src/
    ├── app/
    │   ├── layout.tsx            # root layout + providers
    │   ├── page.tsx              # /  → Dashboard
    │   ├── globals.css           # design tokens + tailwind base
    │   ├── providers.tsx         # wallet + toast + theme providers
    │   ├── payroll/page.tsx
    │   ├── links/page.tsx
    │   ├── milestones/
    │   │   ├── page.tsx
    │   │   └── [id]/page.tsx
    │   ├── audit/page.tsx        # dual-mode: employer + accountant (reads ?key=)
    │   ├── credential/
    │   │   ├── mint/page.tsx     # /credential/mint?payment=...
    │   │   └── [id]/page.tsx     # public viewer
    │   ├── settings/page.tsx
    │   └── claim/
    │       └── [linkId]/page.tsx # public claim page
    ├── components/
    │   ├── ui/                   # primitive components
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Textarea.tsx
    │   │   ├── Select.tsx
    │   │   ├── Dialog.tsx
    │   │   ├── Dropdown.tsx
    │   │   ├── Tooltip.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Card.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── Progress.tsx
    │   │   ├── Table.tsx
    │   │   ├── QRCode.tsx
    │   │   ├── CopyButton.tsx
    │   │   ├── MaskedAmount.tsx  # critical component
    │   │   ├── TruncatedAddress.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── StatusPill.tsx
    │   │   ├── LockIcon.tsx
    │   │   └── PrivateBadge.tsx
    │   ├── layout/
    │   │   ├── Shell.tsx         # sidebar + topbar wrapper
    │   │   ├── Sidebar.tsx
    │   │   ├── TopBar.tsx
    │   │   ├── NetworkPill.tsx
    │   │   └── PageHeader.tsx
    │   ├── wallet/
    │   │   ├── WalletConnectButton.tsx
    │   │   ├── WalletGate.tsx    # renders children only if connected
    │   │   ├── WalletStatusPanel.tsx
    │   │   └── NotConnectedState.tsx
    │   └── features/
    │       ├── payroll/
    │       │   ├── PayrollHistory.tsx
    │       │   ├── CsvUploader.tsx
    │       │   ├── RecipientPreviewTable.tsx
    │       │   ├── ManualEntryTable.tsx
    │       │   ├── RunPayrollButton.tsx
    │       │   ├── PayrollProgressModal.tsx
    │       │   └── PayrollRunDetail.tsx
    │       ├── links/
    │       │   ├── LinkGenerator.tsx
    │       │   ├── LinkDisplay.tsx
    │       │   ├── ActiveLinksTable.tsx
    │       │   └── LinkStatusPill.tsx
    │       ├── milestones/
    │       │   ├── ProjectList.tsx
    │       │   ├── NewProjectDialog.tsx
    │       │   ├── MilestoneList.tsx
    │       │   ├── AddMilestoneForm.tsx
    │       │   └── ApproveMilestoneDialog.tsx
    │       ├── audit/
    │       │   ├── GenerateKeyPanel.tsx
    │       │   ├── KeyDisplay.tsx
    │       │   ├── AccountantPortal.tsx
    │       │   ├── DecryptedRecordsTable.tsx
    │       │   └── KeyHistoryList.tsx
    │       ├── credential/
    │       │   ├── CredentialCard.tsx
    │       │   └── MintCredentialPanel.tsx
    │       ├── claim/
    │       │   ├── ClaimPage.tsx
    │       │   ├── NoWalletPrompt.tsx
    │       │   └── ClaimSuccess.tsx
    │       ├── dashboard/
    │       │   ├── MetricCards.tsx
    │       │   ├── QuickActions.tsx
    │       │   ├── RecentActivity.tsx
    │       │   └── WalletCard.tsx
    │       └── settings/
    │           ├── WalletSettings.tsx
    │           ├── PrivacySettings.tsx
    │           └── AboutPanel.tsx
    ├── lib/
    │   ├── umbra/                # THE ADAPTER LAYER (Section 10)
    │   │   ├── client.ts
    │   │   ├── transfer.ts
    │   │   ├── paymentLink.ts
    │   │   ├── viewingKey.ts
    │   │   ├── balance.ts
    │   │   ├── types.ts
    │   │   └── index.ts
    │   ├── cnft/
    │   │   └── mint.ts
    │   ├── storage/
    │   │   ├── keys.ts           # localStorage key constants
    │   │   ├── payrollRuns.ts
    │   │   ├── hushLinks.ts
    │   │   ├── projects.ts
    │   │   ├── auditKeys.ts
    │   │   └── settings.ts
    │   ├── utils/
    │   │   ├── format.ts         # amounts, dates, addresses
    │   │   ├── csv.ts            # parse + validate CSV
    │   │   ├── validation.ts     # zod schemas
    │   │   ├── cn.ts             # classnames helper
    │   │   └── download.ts       # blob → download helper
    │   └── pdf/
    │       └── auditReport.ts    # jspdf builder for Hush Audit PDF
    ├── hooks/
    │   ├── useUmbra.ts
    │   ├── useWalletState.ts
    │   ├── usePayrollRuns.ts
    │   ├── useHushLinks.ts
    │   ├── useProjects.ts
    │   ├── useAuditKeys.ts
    │   ├── useMaskedAmounts.ts   # global reveal toggle
    │   └── useLocalStorage.ts
    ├── contexts/
    │   ├── RevealContext.tsx     # mask/reveal amounts
    │   └── SettingsContext.tsx
    ├── types/
    │   ├── payroll.ts
    │   ├── link.ts
    │   ├── milestone.ts
    │   ├── audit.ts
    │   ├── credential.ts
    │   └── index.ts
    └── constants/
        ├── tokens.ts             # USDC mint, decimals
        ├── navigation.ts         # sidebar items
        └── content.ts            # reusable copy strings
```

---

## 4. Environment Variables

`.env.example`:

```bash
# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet          # devnet | mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# USDC mint (devnet)
NEXT_PUBLIC_USDC_MINT=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Umbra
NEXT_PUBLIC_UMBRA_NETWORK=devnet
NEXT_PUBLIC_UMBRA_PROGRAM_ID=              # from Umbra docs

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Hush
```

The mainnet USDC mint is `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`.

---

## 5. Configuration Files

### `package.json`

```json
{
  "name": "hush",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@metaplex-foundation/mpl-bubblegum": "^4.0.0",
    "@metaplex-foundation/umi-bundle-defaults": "^0.9.2",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@solana/web3.js": "^1.95.0",
    "@umbra/sdk": "latest",
    "clsx": "^2.1.0",
    "date-fns": "^3.6.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "lucide-react": "^0.400.0",
    "nanoid": "^5.0.7",
    "next": "14.2.5",
    "papaparse": "^5.4.1",
    "qrcode": "^1.5.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.3.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/papaparse": "^5.3.14",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.2"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Hush brand
        bg: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--fg-subtle) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
          strong: 'rgb(var(--border-strong) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          muted: 'rgb(var(--accent-muted) / <alpha-value>)',
        },
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Solana web3 requires these polyfills for browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
    }
    return config
  },
}
module.exports = nextConfig
```

---

## 6. Design Tokens — `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode (used only if user toggles) */
    --bg: 255 255 255;
    --bg-surface: 250 250 249;
    --bg-elevated: 245 245 244;
    --fg: 15 15 15;
    --fg-muted: 100 100 100;
    --fg-subtle: 150 150 150;
    --border: 230 230 230;
    --border-strong: 200 200 200;
    --accent: 29 158 117;      /* teal-green — private signal */
    --accent-muted: 225 245 238;
    --success: 29 158 117;
    --warning: 186 117 23;
    --danger: 162 49 49;
    --info: 24 95 165;
  }

  .dark {
    /* Dark mode — DEFAULT */
    --bg: 15 15 15;            /* near-black, not pure */
    --bg-surface: 26 26 26;
    --bg-elevated: 36 36 36;
    --fg: 245 245 245;
    --fg-muted: 160 160 160;
    --fg-subtle: 110 110 110;
    --border: 45 45 45;
    --border-strong: 70 70 70;
    --accent: 74 200 158;      /* slightly desaturated green for dark */
    --accent-muted: 29 40 35;
    --success: 74 200 158;
    --warning: 240 176 64;
    --danger: 232 90 90;
    --info: 88 160 240;
  }

  html { color-scheme: dark; }
  html.dark { color-scheme: dark; }

  body {
    @apply bg-bg text-fg font-sans antialiased;
    font-feature-settings: 'ss01', 'cv11';
  }

  /* All numeric amounts render in mono */
  .amount { @apply font-mono tabular-nums; }

  /* Reusable focus ring */
  :focus-visible {
    @apply outline-none ring-2 ring-accent ring-offset-2 ring-offset-bg;
  }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center gap-2 px-3 py-2
           rounded-md text-sm font-medium transition-colors
           disabled:opacity-40 disabled:cursor-not-allowed;
  }
  .btn-primary {
    @apply btn bg-accent text-bg hover:opacity-90;
  }
  .btn-secondary {
    @apply btn border border-border hover:bg-bg-surface;
  }
  .btn-ghost {
    @apply btn hover:bg-bg-surface;
  }
  .btn-danger {
    @apply btn bg-danger text-white hover:opacity-90;
  }

  .input {
    @apply w-full h-9 px-3 rounded-md bg-bg-surface border border-border
           text-sm placeholder:text-fg-subtle
           focus:border-border-strong focus:bg-bg;
  }

  .card {
    @apply bg-bg-surface border border-border rounded-lg p-4;
  }

  .card-elevated {
    @apply bg-bg-elevated border border-border rounded-lg p-4;
  }
}
```

**Root layout** sets `html className="dark"` by default.

---

## 7. TypeScript Types — `src/types/`

### `src/types/payroll.ts`

```typescript
export type PayrollRecipient = {
  id: string               // nanoid
  name: string
  umbraAddress: string     // umb1...
  amountUsdc: number       // in USDC, not lamports
  status: 'pending' | 'sending' | 'success' | 'failed'
  txSignature?: string
  error?: string
}

export type PayrollRun = {
  id: string               // nanoid, prefixed 'run_'
  createdAt: string        // ISO
  completedAt?: string
  recipients: PayrollRecipient[]
  totalUsdc: number
  status: 'draft' | 'running' | 'completed' | 'partial' | 'failed'
  network: 'devnet' | 'mainnet-beta'
  senderAddress: string    // Umbra addr of employer
}
```

### `src/types/link.ts`

```typescript
export type HushLink = {
  id: string                // nanoid
  linkToken: string         // opaque token from SDK, used in URL
  url: string               // full claim URL
  amountUsdc: number
  description?: string
  createdAt: string
  expiresAt?: string        // optional
  status: 'active' | 'claimed' | 'expired' | 'revoked'
  claimedAt?: string
  claimTxSignature?: string
  network: 'devnet' | 'mainnet-beta'
  senderAddress: string
}
```

### `src/types/milestone.ts`

```typescript
export type Milestone = {
  id: string
  number: number           // 1, 2, 3...
  description: string
  amountUsdc: number
  status: 'pending' | 'approved' | 'sending' | 'paid' | 'failed'
  approvedAt?: string
  paidAt?: string
  txSignature?: string
  hushLinkId?: string      // link to HushLink record
  error?: string
}

export type Project = {
  id: string
  name: string
  clientDescription?: string
  contractorAddress: string  // Umbra address
  createdAt: string
  status: 'active' | 'completed' | 'archived'
  milestones: Milestone[]
  totalBudgetUsdc: number    // derived: sum of milestones
}
```

### `src/types/audit.ts`

```typescript
export type AuditKeyScope =
  | { type: 'run'; runId: string }
  | { type: 'dateRange'; from: string; to: string }
  | { type: 'all' }

export type AuditKey = {
  id: string
  key: string               // the actual viewing key string from SDK
  scope: AuditKeyScope
  scopeDescription: string  // human-readable
  createdAt: string
  lastUsedAt?: string
}

export type DecryptedRecord = {
  recipient: string         // possibly masked
  amountUsdc: number
  timestamp: string
  memo?: string
  txSignature: string
}
```

### `src/types/credential.ts`

```typescript
export type HushCredential = {
  id: string                // NFT mint address
  type: 'professional_payment'
  verified: true
  threshold: 'received'
  issuer: 'hush'
  timestamp: string
  network: 'solana'
  mintTxSignature: string
}
```

### `src/types/index.ts`

```typescript
export * from './payroll'
export * from './link'
export * from './milestone'
export * from './audit'
export * from './credential'

export type Network = 'devnet' | 'mainnet-beta'
```

---

## 8. LocalStorage Schema — `src/lib/storage/`

### `src/lib/storage/keys.ts`

```typescript
export const STORAGE_KEYS = {
  payrollRuns: 'hush:payroll_runs:v1',
  hushLinks: 'hush:links:v1',
  projects: 'hush:projects:v1',
  auditKeys: 'hush:audit_keys:v1',
  settings: 'hush:settings:v1',
  revealMode: 'hush:reveal:v1',
} as const
```

Each storage module implements this interface:

```typescript
interface StorageModule<T> {
  getAll(): T[]
  get(id: string): T | null
  save(item: T): void
  update(id: string, patch: Partial<T>): T | null
  delete(id: string): void
  clear(): void
}
```

### `src/lib/storage/payrollRuns.ts` (pattern for all storage modules)

```typescript
import { PayrollRun } from '@/types'
import { STORAGE_KEYS } from './keys'

function readAll(): PayrollRun[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.payrollRuns)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(items: PayrollRun[]) {
  localStorage.setItem(STORAGE_KEYS.payrollRuns, JSON.stringify(items))
}

export const payrollStorage = {
  getAll: readAll,
  get: (id: string) => readAll().find(r => r.id === id) ?? null,
  save: (run: PayrollRun) => {
    const all = readAll()
    const idx = all.findIndex(r => r.id === run.id)
    if (idx >= 0) all[idx] = run
    else all.unshift(run)
    writeAll(all)
    window.dispatchEvent(new Event('hush:storage'))
  },
  update: (id: string, patch: Partial<PayrollRun>) => {
    const all = readAll()
    const idx = all.findIndex(r => r.id === id)
    if (idx < 0) return null
    all[idx] = { ...all[idx], ...patch }
    writeAll(all)
    window.dispatchEvent(new Event('hush:storage'))
    return all[idx]
  },
  delete: (id: string) => {
    writeAll(readAll().filter(r => r.id !== id))
    window.dispatchEvent(new Event('hush:storage'))
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.payrollRuns)
    window.dispatchEvent(new Event('hush:storage'))
  },
}
```

Implement `hushLinksStorage`, `projectsStorage`, `auditKeysStorage`, `settingsStorage` with the same pattern.

---

## 9. Hooks — Storage Subscribers

### `src/hooks/useLocalStorage.ts`

Hook that reads from a storage module and subscribes to `hush:storage` events so UI auto-updates.

```typescript
import { useSyncExternalStore } from 'react'

export function useStorageList<T>(getAll: () => T[]): T[] {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('hush:storage', cb)
      window.addEventListener('storage', cb)  // cross-tab sync
      return () => {
        window.removeEventListener('hush:storage', cb)
        window.removeEventListener('storage', cb)
      }
    },
    getAll,
    () => []  // SSR fallback
  )
}
```

### `src/hooks/usePayrollRuns.ts`, `useHushLinks.ts`, `useProjects.ts`, `useAuditKeys.ts`

Thin wrappers:

```typescript
import { payrollStorage } from '@/lib/storage/payrollRuns'
import { useStorageList } from './useLocalStorage'

export function usePayrollRuns() {
  return useStorageList(payrollStorage.getAll)
}
```

---

## 10. Umbra SDK Adapter Layer — Critical

**This layer isolates all Umbra SDK calls behind a stable interface. If the real SDK API differs, only these files change.**

### `src/lib/umbra/types.ts`

```typescript
export type UmbraAddress = string  // umb1...

export type ConfidentialTransferParams = {
  to: UmbraAddress
  amountUsdc: number   // in USDC, adapter converts to raw units
  token: 'USDC'
  memo?: string
}

export type ConfidentialTransferResult = {
  txSignature: string
  encryptedAmount: string  // opaque bytes
  blockTime?: number
}

export type PaymentLinkParams = {
  amountUsdc: number
  token: 'USDC'
  description?: string
  expiresInSeconds?: number
}

export type PaymentLinkResult = {
  linkId: string       // our internal ref
  token: string        // opaque claim token — goes in URL
  url: string          // full claim URL (we construct this)
}

export type ViewingKeyScope =
  | { type: 'run'; runId: string }
  | { type: 'dateRange'; from: Date; to: Date }
  | { type: 'all' }

export type ViewingKeyResult = {
  key: string          // opaque string the accountant pastes
}

export type DecryptedTransfer = {
  from: string
  to: string
  amountUsdc: number
  timestamp: string
  memo?: string
  txSignature: string
}
```

### `src/lib/umbra/client.ts`

```typescript
// Single Umbra client instance, wired with the user's wallet.
// Real implementation will import from @umbra/sdk.

import { WalletContextState } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'

export type UmbraClient = {
  // opaque — wraps the SDK instance
  _wallet: WalletContextState
  _connection: Connection
}

export function createUmbraClient(
  wallet: WalletContextState,
  connection: Connection
): UmbraClient {
  // Real:
  //   import { Umbra } from '@umbra/sdk'
  //   return new Umbra({ wallet, connection, network: 'devnet' })
  return { _wallet: wallet, _connection: connection }
}
```

### `src/lib/umbra/transfer.ts`

```typescript
import { UmbraClient } from './client'
import {
  ConfidentialTransferParams,
  ConfidentialTransferResult,
} from './types'

export async function sendConfidentialTransfer(
  client: UmbraClient,
  params: ConfidentialTransferParams
): Promise<ConfidentialTransferResult> {
  // Real SDK call — replace this:
  //   const result = await umbra.sendConfidentialTransfer({
  //     to: params.to,
  //     amount: toRawUsdc(params.amountUsdc),
  //     token: USDC_MINT,
  //     memo: params.memo,
  //   })
  //   return {
  //     txSignature: result.signature,
  //     encryptedAmount: result.encryptedAmount,
  //     blockTime: result.blockTime,
  //   }

  // Stub for development until SDK is wired:
  await new Promise((r) => setTimeout(r, 1200))
  return {
    txSignature:
      'stub_' + Math.random().toString(36).slice(2, 10) + 'xxxxxxxxxxxx',
    encryptedAmount: 'enc_' + Math.random().toString(36).slice(2, 18),
    blockTime: Math.floor(Date.now() / 1000),
  }
}
```

### `src/lib/umbra/paymentLink.ts`

```typescript
import { nanoid } from 'nanoid'
import { UmbraClient } from './client'
import { PaymentLinkParams, PaymentLinkResult } from './types'

export async function generatePaymentLink(
  client: UmbraClient,
  params: PaymentLinkParams
): Promise<PaymentLinkResult> {
  // Real:
  //   const res = await umbra.createPaymentLink({...})
  //   const token = res.token
  const token = nanoid(22)
  const linkId = 'link_' + nanoid(12)
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return {
    linkId,
    token,
    url: `${base}/claim/${token}`,
  }
}

export async function claimPaymentLink(
  client: UmbraClient,
  token: string
): Promise<{ txSignature: string; amountUsdc: number }> {
  // Real:
  //   return umbra.claimPaymentLink({ token })
  await new Promise((r) => setTimeout(r, 1000))
  return {
    txSignature: 'claim_' + nanoid(18),
    amountUsdc: 0,  // real SDK returns actual amount
  }
}

export async function inspectPaymentLink(
  client: UmbraClient,
  token: string
): Promise<{
  amountUsdc: number
  description?: string
  status: 'active' | 'claimed' | 'expired' | 'revoked'
}> {
  // Real: look up link from chain or SDK
  return { amountUsdc: 0, status: 'active' }
}
```

### `src/lib/umbra/viewingKey.ts`

```typescript
import { nanoid } from 'nanoid'
import { UmbraClient } from './client'
import { ViewingKeyScope, ViewingKeyResult, DecryptedTransfer } from './types'

export async function generateViewingKey(
  client: UmbraClient,
  scope: ViewingKeyScope
): Promise<ViewingKeyResult> {
  // Real:
  //   return umbra.generateViewingKey({ scope })
  return { key: 'vk_' + nanoid(48) }
}

export async function decryptWithViewingKey(
  client: UmbraClient,
  key: string
): Promise<DecryptedTransfer[]> {
  // Real:
  //   return umbra.decryptWithViewingKey({ key })
  // Stub returns mock records in dev mode:
  if (!key.startsWith('vk_')) throw new Error('Invalid viewing key')
  return []
}
```

### `src/lib/umbra/balance.ts`

```typescript
import { UmbraClient } from './client'

export async function getPrivateBalance(
  client: UmbraClient,
  token: 'USDC' = 'USDC'
): Promise<number> {
  // Real: umbra.getPrivateBalance('USDC')
  return 0
}
```

### `src/lib/umbra/index.ts`

```typescript
export * from './types'
export * from './client'
export * from './transfer'
export * from './paymentLink'
export * from './viewingKey'
export * from './balance'
```

### `src/hooks/useUmbra.ts`

```typescript
'use client'

import { useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { createUmbraClient } from '@/lib/umbra/client'

export function useUmbra() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return useMemo(() => {
    if (!wallet.connected || !wallet.publicKey) return null
    return createUmbraClient(wallet, connection)
  }, [wallet.connected, wallet.publicKey, connection])
}
```

---

## 11. Providers & Root Layout

### `src/app/providers.tsx`

```typescript
'use client'

import { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter }
  from '@solana/wallet-adapter-wallets'
import { Toaster } from 'sonner'
import '@solana/wallet-adapter-react-ui/styles.css'
import { RevealProvider } from '@/contexts/RevealContext'

export function Providers({ children }: { children: ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new BackpackWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <RevealProvider>
            {children}
            <Toaster theme="dark" position="top-right" richColors closeButton />
          </RevealProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
```

### `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Hush — private financial operations for Solana',
  description:
    'Every Solana payment is public. Hush changes that. Built on Umbra.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${mono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### `src/contexts/RevealContext.tsx`

Handles global "reveal all amounts" toggle + per-amount reveal.

```typescript
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type RevealContext = {
  globalRevealed: boolean
  toggleGlobal: () => void
  revealedIds: Set<string>
  toggleId: (id: string) => void
  isRevealed: (id: string) => boolean
}

const Ctx = createContext<RevealContext | null>(null)

export function RevealProvider({ children }: { children: ReactNode }) {
  const [globalRevealed, setGlobal] = useState(false)
  const [revealedIds, setRevealed] = useState<Set<string>>(new Set())

  return (
    <Ctx.Provider
      value={{
        globalRevealed,
        toggleGlobal: () => setGlobal((v) => !v),
        revealedIds,
        toggleId: (id) =>
          setRevealed((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
          }),
        isRevealed: (id) => globalRevealed || revealedIds.has(id),
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useReveal() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useReveal must be used within RevealProvider')
  return ctx
}
```

---

## 12. Core UI Components — Specifications

### `MaskedAmount.tsx` — THE most important component

**Purpose**: Display a USDC amount, masked by default (`●●●,●●●`), with an inline eye toggle to reveal.

**Props**:
```typescript
type Props = {
  amount: number          // USDC
  id: string              // unique — for per-instance reveal
  className?: string
  showToggle?: boolean    // default true
  maskStyle?: 'dots' | 'blocks'  // default 'dots'
}
```

**Behavior**:
- Reads from `useReveal()`.
- If revealed: renders `formatUsdc(amount)` in `font-mono`.
- If masked: renders `●●●,●●●` in `font-mono` with slightly muted color.
- Toggle button: `<Eye>` (lucide) when masked, `<EyeOff>` when revealed. Small 14px icon button, aria-label "Reveal amount" / "Hide amount".
- Transition: 150ms fade on switch.
- Tabular-nums alignment.

### `TruncatedAddress.tsx`

**Props**:
```typescript
type Props = {
  address: string
  prefixLen?: number   // default 6
  suffixLen?: number   // default 4
  showCopy?: boolean   // default true
  monospace?: boolean  // default true
}
```

Renders `umb1ax…4k2x` with hover-reveal copy icon.

### `Button.tsx`

Variants: `primary | secondary | ghost | danger`
Sizes: `sm | md | lg`
Props: `loading`, `leftIcon`, `rightIcon`, standard button props.

### `Input.tsx`

Wraps a native input. Props: `label`, `error`, `hint`, `leftIcon`, `rightIcon`. Renders label above, hint/error below.

### `Dialog.tsx`

Wraps Radix `Dialog`. Props: `open`, `onOpenChange`, `title`, `description`, `children`, `footer`. Centered modal, max-w-md default.

### `Dropdown.tsx`

Wraps Radix `DropdownMenu`. Used for: wallet menu, row actions.

### `Badge.tsx`

Variants: `neutral | success | warning | danger | info | accent`. Small rounded pill.

### `StatusPill.tsx`

For any status field. Auto-maps common strings to colors:
- `active | pending | unclaimed | sending → warning`
- `completed | success | paid | claimed → success`
- `failed | error | revoked → danger`
- `draft | archived → neutral`
- `in progress → info`

### `PrivateBadge.tsx`

Small component: lock icon + "Private" text in accent green. Used on every payment row.

### `Table.tsx`

Wraps a styled `<table>`. Sub-components: `Th`, `Td`, `Tr`. Sticky header option.

### `Skeleton.tsx`

Animated pulse div. Props: `width`, `height`, `className`.

### `Progress.tsx`

Horizontal progress bar. Props: `value` (0-100), `max` (default 100).

### `Card.tsx`

Wraps children in `.card` or `.card-elevated` class. Props: `variant` (`surface | elevated`), `padding`.

### `CopyButton.tsx`

Copies text to clipboard, shows "Copied!" for 2s. Props: `value`, `label` (default "Copy").

### `QRCode.tsx`

Renders a QR code using the `qrcode` library. Props: `value`, `size` (default 200).

### `EmptyState.tsx`

Props: `title`, `description`, `action?` (ReactNode button). No illustration — clean text + button only.

### `LockIcon.tsx`

Small lock icon, color variants: `active` (green, encrypted & confirmed), `pending` (amber), `failed` (red). 16px.

---

## 13. Layout Components

### `Shell.tsx`

```typescript
<div className="min-h-screen flex bg-bg">
  <Sidebar />
  <div className="flex-1 flex flex-col">
    <TopBar />
    <main className="flex-1 p-6">{children}</main>
  </div>
</div>
```

### `Sidebar.tsx`

- Fixed width 220px
- Logo + `PrivateBadge` at top
- Nav items from `@/constants/navigation` with active-route highlight
- Nav items show badges for unclaimed counts (driven by hooks)
- Settings link pinned at bottom
- "Powered by Umbra" footer

### `TopBar.tsx`

- Left: current page title from route metadata
- Right: `NetworkPill` + `WalletConnectButton`
- Height 52px, border-bottom

### `NetworkPill.tsx`

Reads `NEXT_PUBLIC_SOLANA_NETWORK`. Amber pill for devnet, green for mainnet.

### `constants/navigation.ts`

```typescript
export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'Home' },
  { href: '/payroll', label: 'Hush Payroll', icon: 'Users' },
  { href: '/links', label: 'Hush Links', icon: 'Link' },
  { href: '/milestones', label: 'Milestones', icon: 'CheckCircle' },
  { href: '/audit', label: 'Hush Audit', icon: 'Key' },
] as const

export const SETTINGS_ITEM = { href: '/settings', label: 'Settings', icon: 'Settings' }
```

---

## 14. Wallet Components

### `WalletConnectButton.tsx`

- Not connected: styled as secondary button "Connect Umbra Wallet" — clicking opens the standard wallet modal.
- Connected: shows `<Dropdown>` with trigger = `<green dot> + <TruncatedAddress>`. Menu items:
  - "Copy address"
  - "Open Umbra Wallet" (deep link)
  - Divider
  - "Disconnect"

### `WalletGate.tsx`

Wraps children. If wallet not connected, renders `<NotConnectedState>` instead. Use to gate feature pages.

### `NotConnectedState.tsx`

Full-card component. Big heading: "Connect Umbra Wallet to continue." Description: "Hush uses the Umbra Wallet to manage keys, sign transactions, and display private balances." Big button: "Connect wallet." Secondary link: "What is Umbra Wallet? →" (to Umbra install page).

### `WalletStatusPanel.tsx`

Card on dashboard. Shows:
- Green dot + "Connected"
- Address (truncated, copy)
- "Private balance: `<MaskedAmount>` USDC"
- Network name
- "Open Umbra Wallet →" link button

---

## 15. Feature Specs

### 15.1 Dashboard — `src/app/page.tsx`

Wrapped in `<Shell>`. Contents:

1. **MetricCards** (grid of 4)
   - Total hushed (sum of `completed` run totals, masked)
   - Active links (count of `active` HushLinks)
   - Payroll runs (count of `completed`)
   - Pending milestones (count of `pending` milestones across all projects)

2. **QuickActions** (3 cards in a row)
   - "Run payroll" → `/payroll`
   - "Generate link" → `/links`
   - "New milestone" → `/milestones`

3. **Recent activity** + **Wallet card** (2-column grid)
   - Activity: latest 5 events across all features, each with icon + label + time + status pill
   - Wallet: `WalletStatusPanel`

4. **Footer bar**: horizontal banner "All payments are private by default · Powered by Umbra SDK · Arcium MPC network" + `PrivateBadge`

### 15.2 Payroll — `src/app/payroll/page.tsx`

Wrapped in `<Shell>` + `<WalletGate>`.

**Components to compose:**
- `PayrollHistory` — top section, list of runs
- Divider
- **New payroll run** section:
  - `CsvUploader` with drag-drop
  - Toggle: "Add recipients manually instead"
  - `RecipientPreviewTable` (appears after parse / manual entry)
  - `RunPayrollButton` with balance pre-check
  - `PayrollProgressModal` (triggered by button)

**`CsvUploader` spec:**
- Accept `.csv` only
- Validate columns: `name`, `umbra_address`, `amount`
- Uses `papaparse.parse(file, { header: true })`
- On valid parse: pushes to `RecipientPreviewTable` state
- On error: red border + error message

**`RecipientPreviewTable` spec:**
- Columns: Name | Umbra address (truncated) | Amount (editable inline number input) | Remove (×)
- Footer: total recipients + total USDC (masked with global reveal)
- Per-row zod validation → disables Run button if any invalid

**Validation rules (zod):**
```typescript
const recipientSchema = z.object({
  name: z.string().min(1),
  umbra_address: z.string().regex(/^umb1[a-zA-Z0-9]{38,}$/, 'Invalid Umbra address'),
  amount: z.number().positive('Must be greater than 0'),
})
```

**`RunPayrollButton` logic:**
1. Show confirmation dialog if total > 10,000 USDC.
2. Create `PayrollRun` with status=`running`, save to storage.
3. Open `PayrollProgressModal`.
4. For each recipient: call `sendConfidentialTransfer`, update recipient status live (per-row progress).
5. After all: update run status to `completed` or `partial`. Modal shows "All payments hushed." or "X of Y completed."
6. Generate button: "Generate audit key for this run."

**`PayrollProgressModal`:**
- Cannot be dismissed while running.
- Shows progress bar + per-recipient list with spinner/check/× per row.
- On completion: two buttons — "Generate audit key" and "Download receipt (CSV)".
- On partial failure: show failed recipients with "Retry" button each.

**`PayrollHistory`:**
- Virtualized list (or simple map if <50 rows).
- Each row: Run ID (truncated) · date (relative + tooltip) · recipient count · total (masked) · status pill · "View details" button.
- Click to expand: shows per-recipient rows.
- Row action: "Generate audit key" → opens audit page pre-scoped.

### 15.3 Hush Links — `src/app/links/page.tsx`

**Layout:**
1. `LinkGenerator` (top card)
2. `ActiveLinksTable` (below, filterable)

**`LinkGenerator` spec:**
- Amount input (number, USDC icon prefix, "Available: `<MaskedAmount>`" below)
- Description input (optional, max 80)
- Expiry dropdown: Never / 24h / 7d / 30d
- "Generate Hush link" button
- On success: `LinkDisplay` replaces the form with the generated link + Copy + QR + Share + "Create another" button

**`LinkDisplay`:**
- Full link in `font-mono` in a rounded bordered box.
- `CopyButton` labeled "Copy link"
- "Show QR" toggle → renders `<QRCode>`
- Small text: "Share this link. Recipient claims via Umbra Wallet."

**`ActiveLinksTable`:**
- Filter pills: All / Unclaimed / Claimed / Expired
- Columns: Description | Amount (masked) | Created (relative) | Expiry | Status pill | Actions
- Actions vary by status:
  - active: Copy · QR · Revoke
  - claimed: "View tx →"
  - expired: Renew
  - revoked: (none, strikethrough row)

**Revoke flow**: opens `Dialog` with "Revoke this link?" confirmation.

### 15.4 Claim page — `src/app/claim/[linkId]/page.tsx`

**Not in Shell.** Standalone full-page layout. Mobile-first.

**States:**

1. **Loading**: centered spinner + "Fetching payment…"

2. **No wallet state** (detect via `window.umbra` or wallet adapter):
   - Large Hush wordmark + green dot at top
   - Heading: "A Hush payment is waiting for you."
   - Subtext: "You need Umbra Wallet to claim this privately."
   - Big green button: "Get Umbra Wallet" (link to install)
   - Small subtext: "Already have it? Connect below" + smaller connect button
   - Amount shown as `●●●●● USDC` — revealed only after claim

3. **Wallet present, not claimed**:
   - "You have a Hush payment" heading
   - After connect: Amount revealed (from `inspectPaymentLink`)
   - Description below if present
   - Big green button: "Claim payment"

4. **Claiming**: button → spinner + "Claiming privately…"

5. **Claimed (success)**:
   - Big green checkmark
   - "Payment received."
   - Amount displayed (mono, large)
   - Two buttons: "View in Umbra Wallet" (deep link) and "Mint your Hush credential" (→ `/credential/mint?payment=<token>`)

6. **Already claimed**: "This Hush link has already been claimed." — no amount, no actions.

7. **Expired**: "This Hush link has expired." + "Contact the sender for a new one."

8. **Revoked / invalid**: "This Hush link is no longer valid."

### 15.5 Milestones — `src/app/milestones/page.tsx` + `/[id]/page.tsx`

**List page (`/milestones`):**
- `ProjectList` — grid of project cards
- "New project" button top-right opens `NewProjectDialog`

**Project card:**
- Project name (bold) + client description
- Contractor address (truncated)
- Total budget (masked)
- Progress bar: paid milestones / total
- Status pill
- Click → navigate to detail

**`NewProjectDialog`:**
- Fields: Project name (required) · Client description · Contractor Umbra address (required, validated)
- Creates project in storage, navigates to detail

**Detail page (`/milestones/[id]`):**
- Project header (editable name, contractor address, status)
- `MilestoneList` — vertical list of milestones
- `AddMilestoneForm` — inline form below list

**Milestone row:**
- `#N` | description | amount (masked) | status pill | action
- Pending → "Approve & send" button
- Approved → "Sending..." with spinner
- Paid → "Copy Hush link for contractor" + status (claimed/unclaimed)
- Failed → "Retry" button

**`ApproveMilestoneDialog`:**
- "Approve milestone #N: [description]"
- Amount revealed (mono, large)
- Contractor address
- Warning: "This will send X USDC privately. This cannot be undone."
- Confirm button flow:
  1. Mark milestone status=`sending`
  2. Call `sendConfidentialTransfer`
  3. Generate Hush link for contractor (so they can claim via link flow)
  4. Mark status=`paid`, store link ID
  5. Toast: "Milestone paid. Share the Hush link with your contractor."
  6. Show the link inline with Copy button

### 15.6 Hush Audit — `src/app/audit/page.tsx`

**Dual-mode route. Reads `?key=` query param:**
- If `key` present (and valid format): **accountant mode** (no wallet required, no Shell sidebar)
- If no `key`: **employer mode** (Shell + WalletGate)

**Employer mode components:**
1. `GenerateKeyPanel`
   - Scope selector (radio): Specific payroll run / Date range / All time
   - Run selector dropdown (if run mode)
   - Date range picker (if date range mode)
   - "Generate audit key" button → calls `generateViewingKey`
   - On success: `KeyDisplay` reveals

2. `KeyDisplay`
   - Full key in `font-mono` (wrapped, max-w)
   - "Copy key" button
   - "Copy secure link" (copies `${APP_URL}/audit?key=${key}` — accountant just clicks)
   - "Show QR" toggle
   - "Revoke (local)" button — removes from local history

3. `KeyHistoryList`
   - Table of generated keys: scope description · created · last used · actions
   - Actions: Copy, Share link, Delete

**Accountant mode (`?key=...`):**
1. Branded header: Hush wordmark + "Hush Audit"
2. "Paste your audit key" textarea (pre-filled from `?key=`)
3. "Decrypt records" green button
4. On click:
   - Call `decryptWithViewingKey`
   - Render `DecryptedRecordsTable`
5. Error state: red-bordered input + "Invalid or expired key"

**`DecryptedRecordsTable`:**
- Summary bar: `X payments · Total Y USDC · Range: A to B · Source: [scope]`
- Columns: # | Recipient (masked) | Amount | Date | Time | Memo | Tx (Solscan link)
- Sortable, sticky header
- **Amounts are SHOWN, not masked** — accountant needs them
- "Export CSV" button → generate + download
- "Export PDF" button → jspdf + autotable

**PDF format (`src/lib/pdf/auditReport.ts`):**
- Hush wordmark + "Audit Report" header
- Summary block
- Table of transactions
- Footer: "Generated via Hush Audit · Powered by Umbra · ISO timestamp"

### 15.7 Credential — `src/app/credential/mint/page.tsx` + `/[id]/page.tsx`

**Mint page:**
1. `CredentialCard` preview (what the cNFT will look like)
2. Attribute list: what's being minted onchain
3. "Mint Hush credential" button
4. Success state: success screen + "View in Umbra Wallet" + "Share credential link"

**Mint logic (`src/lib/cnft/mint.ts`):**
- Uses Bubblegum via UMI
- Collection: a devnet collection we create (document its address in README)
- Metadata JSON hosted on a simple public URL or data URI
- Attributes (from `types/credential.ts`): type, verified, threshold, issuer, timestamp, network
- Returns: mint tx signature + asset ID

**Public viewer (`/credential/[id]`):**
- Renders `CredentialCard` styled version of the cNFT
- "Verified on Solana" link to explorer
- Used as: a shareable reputation badge URL

**`CredentialCard`:**
- Dark bg gradient-free flat card
- "Hush Credential" title
- "Professional payment received"
- Privacy badge: "No amounts · No wallet links · No employer names"
- Umbra + Hush logos at bottom
- ISO date mono text

### 15.8 Settings — `src/app/settings/page.tsx`

Sections:

1. **WalletSettings**
   - Connected wallet: address + "Disconnect" button
   - RPC URL: text input + "Test connection" button
   - Network: devnet/mainnet toggle (updates `settings` storage; requires reload)
   - "Open Umbra Wallet" deep link

2. **PrivacySettings**
   - "Hide amounts by default" toggle (updates reveal context)
   - "Clear local data" destructive button → confirmation dialog requiring typing "clear"

3. **AboutPanel**
   - Hush version
   - Umbra SDK version
   - "View on GitHub" link
   - "Powered by Umbra" card with docs link
   - "Built for Solana Frontier Hackathon"

---

## 16. Utility Functions

### `src/lib/utils/format.ts`

```typescript
import { formatDistanceToNow, format } from 'date-fns'

export function formatUsdc(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function maskedUsdc(approxLength = 7): string {
  // returns '●●●,●●●'
  return '●'.repeat(Math.max(3, approxLength - 4)) + ',' + '●'.repeat(3)
}

export function truncateAddress(addr: string, prefix = 6, suffix = 4): string {
  if (addr.length <= prefix + suffix) return addr
  return `${addr.slice(0, prefix)}…${addr.slice(-suffix)}`
}

export function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function fullTimestamp(iso: string): string {
  return format(new Date(iso), 'PPpp')
}

export function toRawUsdc(amountUsdc: number): bigint {
  return BigInt(Math.round(amountUsdc * 1_000_000))  // USDC has 6 decimals
}

export function fromRawUsdc(raw: bigint | number): number {
  return Number(raw) / 1_000_000
}
```

### `src/lib/utils/csv.ts`

```typescript
import Papa from 'papaparse'
import { z } from 'zod'

const rowSchema = z.object({
  name: z.string().trim().min(1),
  umbra_address: z.string().trim().regex(/^umb1[a-zA-Z0-9]{38,}$/),
  amount: z.coerce.number().positive(),
})

export type CsvRow = z.infer<typeof rowSchema>

export function parsePayrollCsv(text: string): {
  rows: CsvRow[]
  errors: { row: number; message: string }[]
} {
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  })

  const rows: CsvRow[] = []
  const errors: { row: number; message: string }[] = []

  parsed.data.forEach((raw: any, i) => {
    const result = rowSchema.safeParse(raw)
    if (result.success) rows.push(result.data)
    else errors.push({ row: i + 2, message: result.error.issues[0].message })
  })

  return { rows, errors }
}

export function generateRunReceiptCsv(run: PayrollRun): string {
  const headers = ['run_id', 'recipient_name', 'umbra_address', 'amount_usdc', 'status', 'tx_signature']
  const rows = run.recipients.map(r => [
    run.id, r.name, r.umbraAddress, r.amountUsdc, r.status, r.txSignature ?? '',
  ])
  return Papa.unparse([headers, ...rows])
}
```

### `src/lib/utils/download.ts`

```typescript
export function downloadBlob(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

### `src/lib/utils/cn.ts`

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 17. Error Handling + Loading Patterns

**Every async action follows this pattern:**

```typescript
async function run() {
  try {
    setStatus('loading')
    const result = await action()
    toast.success('Done')
    setStatus('idle')
    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    toast.error(message)
    setStatus('idle')
    throw err
  }
}
```

**Loading states:**
- Buttons: spinner replaces label, width preserved, disabled.
- Tables: skeleton rows (3 rows of grey pulsing bars).
- Metrics: `---` dashes until ready, then masked value.

**Toast conventions** (via sonner):
- `toast.success('3 payments hushed.')`
- `toast.error('Payment failed — check Umbra address.')`
- `toast.info('Generating viewing key…')`
- `toast.warning('Link expires in 2 hours.')`

**Error boundaries:**
- Global error boundary in `app/error.tsx` with "Something went wrong" + retry button.
- Per-feature error boundaries optional; trust the global one for hackathon scope.

---

## 18. BUILD ORDER — Follow This Exactly

Don't build in parallel. Do one phase at a time, verify it works, then move on.

### Phase 0 — Setup (30 min)
1. `create-next-app` with TypeScript, Tailwind, App Router, no src dir (yes, use `src/`), alias `@/*`.
2. Install all dependencies from Section 5.
3. Set up `.env.example` and `.env.local` with devnet values.
4. Create `tailwind.config.ts`, `next.config.js`, `tsconfig.json` per Section 5.
5. Create `src/app/globals.css` with tokens from Section 6.
6. Verify `pnpm dev` loads blank page.

### Phase 1 — Foundations (2 hrs)
1. Create all types in `src/types/`.
2. Create all storage modules in `src/lib/storage/`.
3. Create all hooks in `src/hooks/`.
4. Create `RevealContext` in `src/contexts/`.
5. Create `src/lib/utils/` utilities.
6. Create UI primitives in `src/components/ui/` (Button, Input, Dialog, Badge, Card, Table, Skeleton, Progress, CopyButton, EmptyState, StatusPill, LockIcon, PrivateBadge).
7. Create `MaskedAmount` and `TruncatedAddress` — test them standalone.

### Phase 2 — Umbra adapter + wallet (2 hrs)
1. Build entire `src/lib/umbra/` adapter (with stubs).
2. Create `Providers` in `src/app/providers.tsx`.
3. Update root `layout.tsx`.
4. Create `WalletConnectButton`, `WalletGate`, `NotConnectedState`, `WalletStatusPanel`.
5. Create `useUmbra` hook.
6. Verify: connecting Phantom on devnet works end-to-end.

### Phase 3 — Shell + Dashboard (2 hrs)
1. Build `Sidebar`, `TopBar`, `NetworkPill`, `Shell`.
2. Build dashboard page with `MetricCards`, `QuickActions`, `RecentActivity`, `WalletCard`.
3. Add `PrivateBadge` banner at bottom.
4. Verify: dashboard renders, shows masked metrics, nav works.

### Phase 4 — Payroll (4 hrs)
1. `CsvUploader` with drag-drop + papaparse.
2. `RecipientPreviewTable` with inline edit + validation.
3. `RunPayrollButton` with balance check + confirmation dialog.
4. `PayrollProgressModal` with per-recipient live updates.
5. `PayrollHistory` with expandable rows.
6. Wire to `sendConfidentialTransfer`. End-to-end test with stub SDK.

### Phase 5 — Hush Links + Claim (3 hrs)
1. `LinkGenerator` + `LinkDisplay` + QR.
2. `ActiveLinksTable` with filter pills.
3. `/claim/[linkId]/page.tsx` — all 8 states from Section 15.4.
4. Mobile test the claim page — this is critical.

### Phase 6 — Hush Audit (3 hrs)
1. `GenerateKeyPanel` with scope selector.
2. `KeyDisplay` with copy + secure link + QR.
3. `KeyHistoryList`.
4. Accountant mode (`?key=...`) without Shell.
5. `DecryptedRecordsTable` with CSV export.
6. PDF export via jspdf.
7. **This is the demo money shot — polish it.**

### Phase 7 — Milestones (2 hrs)
1. `ProjectList` + `NewProjectDialog`.
2. `MilestoneList` + `AddMilestoneForm`.
3. `ApproveMilestoneDialog` → fires transfer + generates link.
4. Progress bar derivation.

### Phase 8 — Credential (2 hrs)
1. Configure UMI + Bubblegum in `src/lib/cnft/mint.ts`.
2. Create a devnet collection NFT ahead of time, document address.
3. `CredentialCard` visual.
4. Mint page flow.
5. Public viewer.

### Phase 9 — Settings + polish (2 hrs)
1. Settings page sections.
2. Empty states audit across all pages.
3. Loading skeleton audit.
4. Toast audit — every async action has one.
5. Validation audit — all inputs have zod.
6. Dark mode audit — everything readable.

### Phase 10 — README + deploy (1 hr)
1. README with structure from Section 19.
2. Deploy to Vercel.
3. Test the deployed version end-to-end.
4. Add screenshots + demo video to README.

**Total estimated time: ~24 hours of focused build work.**

---

## 19. README Template

```markdown
# Hush — Private financial operations for Solana

Every Solana payment is public. Hush changes that.

Built on Umbra. Private by default. Auditable on demand.

**Live demo**: https://hush.vercel.app (Solana devnet)

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
git clone https://github.com/you/hush
cd hush
pnpm install
cp .env.example .env.local
pnpm dev
```

## Build
pnpm build && pnpm start

## Architecture
See SPEC.md.

## Devnet addresses
- USDC mint: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
- Hush collection: <filled at deploy time>

## Built for Solana Frontier Hackathon — Umbra side track.
```

---

## 20. Things Claude Code Should NOT Do

- **Do not invent a cryptographically-accurate viewing key implementation.** Trust the SDK.
- **Do not build a backend or API routes for business logic.** LocalStorage + on-chain is the store.
- **Do not add auth, multi-tenancy, or user accounts.** Single-wallet app.
- **Do not add animations beyond `fade-in` and `pulse-soft`.** No scroll animations, parallax, etc.
- **Do not import UI libraries like MUI, Mantine, Chakra.** Tailwind + Radix primitives only.
- **Do not create a dark-mode toggle before getting the dark mode itself correct.** Dark is default.
- **Do not use `any` in TypeScript.** If unsure, use `unknown` + narrow.
- **Do not add test files unless explicitly asked.** Hackathon scope.
- **Do not use emoji in the UI.** Use lucide icons.
- **Do not use title case or ALL CAPS in UI copy.** Sentence case everywhere except the wordmark.

---

## 21. Implementation Hints

### Stubbing SDK calls during development
Every SDK function in `src/lib/umbra/` has a working stub returning mock data. This lets you build and test the whole UI before the real SDK is wired. When ready, replace the stub body with the real SDK call — function signatures stay identical.

### Masked amount math
Never do this:
```tsx
<span>{globalRevealed ? `$${amount}` : '●●●,●●●'}</span>
```

Do this:
```tsx
<MaskedAmount id={`payroll-${run.id}-total`} amount={run.totalUsdc} />
```

The component handles transitions, tabular nums, and toggle.

### Keeping payroll run state consistent
When running payroll:
1. Save the `PayrollRun` with all recipients `status=pending` BEFORE starting any transfers.
2. For each recipient: `update(runId, { recipients: [...updated] })` as status changes.
3. Live UI reads via `usePayrollRuns()` — updates propagate through storage events.

### Network switching
When user changes network in Settings, update `NEXT_PUBLIC_SOLANA_NETWORK` in runtime via a `SettingsContext` (since env vars are build-time). The RPC endpoint should also be settable at runtime for devnet testing.

### PDF generation
Keep jspdf on the client. Don't generate server-side. Use `jspdf-autotable` for the records table. Base template:

```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function generateAuditPdf(records: DecryptedRecord[], scope: string) {
  const doc = new jsPDF()
  doc.setFontSize(20)
  doc.text('hush.', 14, 20)
  doc.setFontSize(14)
  doc.text('Audit Report', 14, 30)
  doc.setFontSize(10)
  doc.text(`Scope: ${scope}`, 14, 38)
  doc.text(`Generated: ${new Date().toISOString()}`, 14, 44)

  autoTable(doc, {
    startY: 52,
    head: [['#', 'Recipient', 'Amount (USDC)', 'Date', 'Memo']],
    body: records.map((r, i) => [
      i + 1,
      r.recipient,
      r.amountUsdc.toFixed(2),
      new Date(r.timestamp).toLocaleString(),
      r.memo ?? '',
    ]),
  })

  doc.save(`hush-audit-${Date.now()}.pdf`)
}
```

---

## 22. Demo Data Seeding

For demo/testing, include a "Seed demo data" button in Settings that populates:
- 3 payroll runs (completed)
- 2 active Hush links + 1 claimed
- 1 project with 3 milestones (1 paid, 2 pending)
- 2 audit keys in history

Remove this before production but keep for the demo video.

```typescript
export function seedDemoData() {
  const demoRuns: PayrollRun[] = [/* ... */]
  demoRuns.forEach(r => payrollStorage.save(r))
  // ... etc
  toast.success('Demo data seeded')
}
```

---

## 23. Final Polish Checklist

Before shipping, verify:

- [ ] Every button has a loading state
- [ ] Every table has an empty state
- [ ] Every input has validation with zod
- [ ] Every async action shows a toast on success/failure
- [ ] Every amount is masked by default
- [ ] Every address is truncated (with copy on hover)
- [ ] Every timestamp shows relative + absolute (tooltip)
- [ ] Dark mode is readable everywhere
- [ ] The claim page works on mobile (test on actual phone)
- [ ] Viewing key decryption in accountant mode works without wallet
- [ ] PDF export downloads with correct filename
- [ ] CSV import rejects invalid rows with clear errors
- [ ] Wallet disconnection clears UI to not-connected state
- [ ] Network pill reflects actual connected network
- [ ] "Powered by Umbra" is visible on every page
- [ ] `PrivateBadge` is visible on every page
- [ ] 404 page exists (`app/not-found.tsx`)
- [ ] Global error boundary exists (`app/error.tsx`)
- [ ] Favicon is set (use a simple green dot SVG)

---

## 24. Glossary for Claude Code

- **Umbra Wallet**: the companion wallet app that holds user keys and shows private balances. Hush deep-links to it but never replicates its functionality.
- **Hush link**: a payment link generated by Hush, backed by Umbra's `generatePaymentLink` primitive.
- **Audit key**: Hush's branded name for an Umbra viewing key scoped to some subset of transactions.
- **Hush credential**: a compressed NFT minted after a payment is received, used as a non-revealing reputation primitive.
- **Confidential transfer**: Umbra's private USDC transfer primitive — amount + recipient encrypted.
- **Shielded pool**: the private USDC balance held privately via Umbra. Hush doesn't manage this — the Umbra Wallet does.

---

**End of specification.**

When building, reference this document section by section. Always verify functional correctness before moving to the next phase. Build one feature fully before starting the next. The goal is a polished, demo-ready product in 24 hours of focused work.