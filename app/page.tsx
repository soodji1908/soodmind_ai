import Link from 'next/link';
import { ArrowRight, Briefcase, Building2, GraduationCap, ShieldCheck } from 'lucide-react';
import { PORTALS } from '@/lib/auth/portals';
import { PORTAL_THEMES } from '@/components/shared/portal/portal-theme';
import { BrandMark } from '@/components/shared/auth/auth-shell';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const CARDS = [
  { key: 'estate' as const, Icon: Building2, description: 'Property search, price estimates, market trends and investment analysis.' },
  { key: 'career' as const, Icon: GraduationCap, description: 'Resume analysis, job matching, skill gaps and application tracking.' },
  { key: 'recruiter' as const, Icon: Briefcase, description: 'Post vacancies, rank candidates and manage your hiring pipeline.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <BrandMark portal="estate" />
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-16">
        <div className="max-w-3xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">ESTATEMIND AI</p>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
            Intelligence That Powers Property &amp; Careers.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Three focused products, one ecosystem. Choose the portal that matches your goal. Each has its own sign-in,
            dashboard and permissions.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ key, Icon, description }) => {
            const config = PORTALS[key];
            const theme = PORTAL_THEMES[key];
            return (
              <div
                key={key}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="space-y-5">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme.brandMark}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-card-foreground">{config.name}</h2>
                    <p className={`text-sm font-medium ${theme.accentText}`}>{config.tagline}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={config.loginPath}
                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition-colors ${theme.primaryButton}`}
                  >
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href={`${config.basePath}/signup`}
                    className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Super Administrator</p>
              <p className="text-xs text-muted-foreground">Restricted access for platform owners.</p>
            </div>
          </div>
          <Link href={PORTALS.admin.loginPath} className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
            Administrator sign in
          </Link>
        </div>
      </main>
      <footer className="border-t border-border/70 bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} EstateMind AI. All rights reserved.</p>
          <Link href="/ownership" className="font-medium text-foreground underline-offset-4 hover:underline">Platform ownership</Link>
        </div>
      </footer>
    </div>
  );
}
