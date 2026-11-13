import Image from 'next/image';
import { PORTALS, type PortalKey } from '@/lib/auth/portals';
import { PORTAL_THEMES } from '@/components/shared/portal/portal-theme';

export function BrandMark({ portal, inverse = false }: { portal: PortalKey; inverse?: boolean }) {
  const config = PORTALS[portal];
  const theme = PORTAL_THEMES[portal];
  const Icon = theme.icon;

  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${theme.brandMark}`}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className={`text-base font-semibold ${inverse ? 'text-white' : theme.brandText}`}>{config.name}</p>
        <p className={`text-xs ${inverse ? 'text-white/70' : 'text-muted-foreground'}`}>{config.tagline}</p>
      </div>
    </div>
  );
}

export function AuthShell({
  portal,
  title,
  subtitle,
  children,
  footer,
}: {
  portal: PortalKey;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const config = PORTALS[portal];
  const theme = PORTAL_THEMES[portal];

  return (
    <div className={`grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] ${theme.pageBackground}`}>
      <aside className={`relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 ${theme.heroBackground}`}>
        {config.imageUrl ? (
          <Image
            src={config.imageUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 0vw"
            className="object-cover opacity-70"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" aria-hidden="true" />
        <div className="relative">
          <BrandMark portal={portal} inverse />
        </div>
        <div className="relative max-w-lg space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{config.tagline}</p>
          <p className="text-3xl font-semibold leading-[1.2] text-white">{config.description}</p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="mb-10 lg:hidden">
            <BrandMark portal={portal} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
