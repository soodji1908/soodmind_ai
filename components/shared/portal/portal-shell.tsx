'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PORTALS, type PortalKey } from '@/lib/auth/portals';
import { BrandMark } from '@/components/shared/auth/auth-shell';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { PORTAL_NAV, PORTAL_THEMES, type PortalNavItem } from './portal-theme';

type PortalShellProps = {
  portal: PortalKey;
  displayName: string;
  email: string;
  roleLabel: string;
  children: React.ReactNode;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function PortalShell({ portal, displayName, email, roleLabel, children }: PortalShellProps) {
  const config = PORTALS[portal];
  const theme = PORTAL_THEMES[portal];
  const navItems = PORTAL_NAV[portal];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`min-h-screen ${theme.pageBackground}`}>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r lg:flex ${theme.sidebar} ${theme.sidebarBorder}`}
      >
        <SidebarBody portal={portal} navItems={navItems} roleLabel={roleLabel} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className={`w-72 p-0 ${theme.sidebar} ${theme.sidebarBorder}`}>
          <SheetHeader className="sr-only">
            <SheetTitle>{config.name} navigation</SheetTitle>
            <SheetDescription>Portal navigation menu</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <SidebarBody
              portal={portal}
              navItems={navItems}
              roleLabel={roleLabel}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="lg:hidden">
                <BrandMark portal={portal} />
              </div>
              <div className="hidden min-w-0 items-center gap-3 lg:flex">
                <BrandMark portal={portal} />
                <span className="h-6 w-px bg-border" aria-hidden="true" />
                <span className="truncate text-sm font-semibold text-foreground">{config.name}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <nav className="hidden items-center gap-4 text-xs font-medium text-muted-foreground md:flex" aria-label="Platform links">
                <Link href="/ownership" className="transition-colors hover:text-foreground">Ownership</Link>
                <Link href="/" className="transition-colors hover:text-foreground">All portals</Link>
              </nav>
              <ThemeToggle />
              <ProfileMenu
                portal={portal}
                displayName={displayName}
                email={email}
                roleLabel={roleLabel}
              />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-8rem)] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <footer className="border-t border-border/70 bg-background/70 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {config.name}. All rights reserved.</p>
            <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
              <Link href="/ownership" className="transition-colors hover:text-foreground">Platform ownership</Link>
              <Link href="/" className="transition-colors hover:text-foreground">All portals</Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarBody({
  portal,
  navItems,
  roleLabel,
  onNavigate,
}: {
  portal: PortalKey;
  navItems: PortalNavItem[];
  roleLabel: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const theme = PORTAL_THEMES[portal];

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 items-center border-b px-6 ${theme.sidebarBorder}`}>
        <BrandMark portal={portal} />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6" aria-label={`${PORTALS[portal].name} navigation`}>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                active ? theme.sidebarItemActive : theme.sidebarItem
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t px-6 py-5 ${theme.sidebarBorder}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Signed in as</p>
        <p className="mt-1 text-sm font-medium text-foreground">{roleLabel}</p>
      </div>
    </div>
  );
}

function ProfileMenu({
  portal,
  displayName,
  email,
  roleLabel,
}: {
  portal: PortalKey;
  displayName: string;
  email: string;
  roleLabel: string;
}) {
  const config = PORTALS[portal];
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.assign(config.loginPath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 gap-2 rounded-full px-1.5 pr-3 transition-colors hover:bg-muted"
          aria-label="Open account menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[10rem] truncate text-sm font-medium sm:block">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>
          <p className="pt-1 text-xs font-medium text-muted-foreground">{roleLabel}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            if (!signingOut) void handleSignOut();
          }}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? 'Signing out' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
