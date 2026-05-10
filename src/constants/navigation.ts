import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  Home,
  Key,
  Link as LinkIcon,
  Settings,
  Users,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/payroll', label: 'Hush Payroll', icon: Users },
  { href: '/links', label: 'Hush Links', icon: LinkIcon },
  { href: '/milestones', label: 'Milestones', icon: CheckCircle2 },
  { href: '/audit', label: 'Hush Audit', icon: Key },
] as const

export const SETTINGS_ITEM: NavItem = {
  href: '/settings',
  label: 'Settings',
  icon: Settings,
}

export const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/payroll': 'Hush Payroll',
  '/links': 'Hush Links',
  '/milestones': 'Milestones',
  '/audit': 'Hush Audit',
  '/settings': 'Settings',
}
