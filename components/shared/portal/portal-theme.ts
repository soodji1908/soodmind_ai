import { Briefcase, Building2, GraduationCap, LayoutDashboard, ShieldCheck, Users, CalendarDays, FileText, ClipboardList, LifeBuoy, Settings, MapPinned, FileBarChart, CreditCard, type LucideIcon } from 'lucide-react';
import type { PortalKey } from '@/lib/auth/portals';

export type PortalTheme = {
  icon: LucideIcon;
  pageBackground: string;
  sidebar: string;
  sidebarBorder: string;
  sidebarItem: string;
  sidebarItemActive: string;
  brandMark: string;
  brandText: string;
  heroBackground: string;
  primaryButton: string;
  accentText: string;
  accentSurface: string;
  focusRing: string;
};

export const PORTAL_THEMES: Record<PortalKey, PortalTheme> = {
  estate: {
    icon: Building2,
    pageBackground: 'bg-stone-50 dark:bg-stone-950',
    sidebar: 'bg-white dark:bg-stone-900',
    sidebarBorder: 'border-stone-200 dark:border-stone-800',
    sidebarItem: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
    sidebarItemActive: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
    brandMark: 'bg-emerald-700 text-white',
    brandText: 'text-stone-900 dark:text-stone-100',
    heroBackground: 'bg-emerald-950',
    primaryButton: 'bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    accentSurface: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300',
    focusRing: 'focus-visible:ring-emerald-600',
  },
  career: {
    icon: GraduationCap,
    pageBackground: 'bg-slate-50 dark:bg-slate-950',
    sidebar: 'bg-white dark:bg-slate-900',
    sidebarBorder: 'border-slate-200 dark:border-slate-800',
    sidebarItem: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    sidebarItemActive: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
    brandMark: 'bg-blue-600 text-white',
    brandText: 'text-slate-900 dark:text-slate-100',
    heroBackground: 'bg-blue-950',
    primaryButton: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    accentText: 'text-blue-600 dark:text-blue-400',
    accentSurface: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
    focusRing: 'focus-visible:ring-blue-500',
  },
  recruiter: {
    icon: Briefcase,
    pageBackground: 'bg-slate-50 dark:bg-slate-950',
    sidebar: 'bg-white dark:bg-slate-900',
    sidebarBorder: 'border-slate-200 dark:border-slate-800',
    sidebarItem: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
    sidebarItemActive: 'bg-violet-50 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300',
    brandMark: 'bg-violet-600 text-white',
    brandText: 'text-slate-900 dark:text-slate-100',
    heroBackground: 'bg-violet-950',
    primaryButton: 'bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500',
    accentText: 'text-violet-600 dark:text-violet-400',
    accentSurface: 'bg-violet-50 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300',
    focusRing: 'focus-visible:ring-violet-500',
  },
  admin: {
    icon: ShieldCheck,
    pageBackground: 'bg-slate-100 dark:bg-slate-950',
    sidebar: 'bg-slate-950 dark:bg-slate-900',
    sidebarBorder: 'border-slate-800',
    sidebarItem: 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100',
    sidebarItemActive: 'bg-cyan-500/15 text-cyan-300',
    brandMark: 'bg-cyan-500 text-slate-950',
    brandText: 'text-slate-100',
    heroBackground: 'bg-slate-950',
    primaryButton: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 focus-visible:ring-cyan-400',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    accentSurface: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
    focusRing: 'focus-visible:ring-cyan-400',
  },
};

export type PortalNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const PORTAL_NAV: Record<PortalKey, PortalNavItem[]> = {
  estate: [
    { href: '/estate/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/estate/properties', label: 'Properties', icon: Building2 },
    { href: '/estate/leads', label: 'Lead CRM', icon: Users },
    { href: '/estate/appointments', label: 'Appointments', icon: CalendarDays },
    { href: '/estate/enquiries', label: 'Enquiries', icon: ClipboardList },
    { href: '/estate/insights', label: 'Market insights', icon: FileBarChart },
    { href: '/estate/tickets', label: 'Support', icon: LifeBuoy },
  ],
  career: [
    { href: '/career/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/career/resumes', label: 'Resume library', icon: FileText },
    { href: '/career/applications', label: 'Applications', icon: Briefcase },
    { href: '/career/interviews', label: 'Interview practice', icon: CalendarDays },
    { href: '/career/tickets', label: 'Support', icon: LifeBuoy },
  ],
  recruiter: [
    { href: '/recruiter/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/recruiter/jobs', label: 'Job vacancies', icon: Briefcase },
    { href: '/recruiter/tickets', label: 'Support', icon: LifeBuoy },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'User directory', icon: Users },
    { href: '/admin/adminTickets', label: 'Support operations', icon: LifeBuoy },
    { href: '/admin/audit', label: 'Audit log', icon: ClipboardList },
    { href: '/admin/allProperties', label: 'Global properties', icon: Building2 },
    { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { href: '/admin/payments', label: 'Payment ledger', icon: CreditCard },
    { href: '/admin/organizations', label: 'Organizations', icon: Briefcase },
    { href: '/admin/settings', label: 'Platform controls', icon: Settings },
  ],
};
