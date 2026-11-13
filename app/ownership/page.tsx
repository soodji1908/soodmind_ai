import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle2, Info, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

function configured(value: string | undefined) {
  return value?.trim() || '';
}

export default function OwnershipPage() {
  const founder = configured(process.env.PLATFORM_FOUNDER_NAME);
  const cofounders = configured(process.env.PLATFORM_COFOUNDER_NAMES)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  const legalEntity = configured(process.env.PLATFORM_LEGAL_ENTITY);
  const contactEmail = configured(process.env.PLATFORM_CONTACT_EMAIL);
  const website = configured(process.env.PLATFORM_WEBSITE);
  const hasOwnershipDetails = Boolean(founder || cofounders.length || legalEntity);

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to portals
        </Link>
        <section className="mt-8 overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-10 text-white sm:px-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">About the platform</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Platform ownership</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
              Ownership and leadership information for EstateMind AI. Names and organization details are shown only when they have been configured by the platform owner.
            </p>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-10">
            <article className="rounded-2xl border p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" /> Founder</div>
              <p className="mt-3 text-lg font-semibold">{founder || 'Not publicly configured'}</p>
              {!founder && <p className="mt-1 text-sm text-muted-foreground">Founder information has not been published in the project configuration.</p>}
            </article>
            <article className="rounded-2xl border p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-primary" /> Co-founder{cofounders.length === 1 ? '' : 's'}</div>
              {cofounders.length ? <ul className="mt-3 space-y-2">{cofounders.map((name) => <li key={name} className="text-lg font-semibold">{name}</li>)}</ul> : <><p className="mt-3 text-lg font-semibold">Not publicly configured</p><p className="mt-1 text-sm text-muted-foreground">Co-founder information has not been published in the project configuration.</p></>}
            </article>
            <article className="rounded-2xl border p-5 sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4 text-primary" /> Organization details</div>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Legal entity</dt><dd className="mt-1 font-medium">{legalEntity || 'Not publicly configured'}</dd></div>
                <div><dt className="text-muted-foreground">Contact email</dt><dd className="mt-1 font-medium">{contactEmail || 'Not publicly configured'}</dd></div>
                <div><dt className="text-muted-foreground">Website</dt><dd className="mt-1 break-all font-medium">{website || 'Not publicly configured'}</dd></div>
              </dl>
            </article>
          </div>
          <div className="border-t bg-muted/30 px-6 py-4 sm:px-10">
            <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              {hasOwnershipDetails ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
              {hasOwnershipDetails
                ? 'Displayed details are read from the deployment environment configuration. Please verify legal and ownership records before relying on them.'
                : 'No founder, co-founder or legal-entity names were present in the supplied project. This page intentionally avoids inventing ownership claims. Configure the values in your deployment environment to publish verified details.'}
            </p>
          </div>
        </section>
        <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} EstateMind AI. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-5" aria-label="Footer navigation">
            <Link href="/" className="transition-colors hover:text-foreground">All portals</Link>
            <Link href="/career/login" className="transition-colors hover:text-foreground">Career portal</Link>
            <Link href="/estate/login" className="transition-colors hover:text-foreground">Building portal</Link>
            <Link href="/recruiter/login" className="transition-colors hover:text-foreground">Job portal</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
