import { CheckCircle2, LogOut, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LoginActivityItem } from '@/lib/auth/activity-queries';

const EVENT_META: Record<string, { label: string; icon: typeof CheckCircle2; tone: string }> = {
  login_success: { label: 'Signed in', icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400' },
  login_denied: { label: 'Sign-in denied', icon: ShieldAlert, tone: 'text-rose-600 dark:text-rose-400' },
  logout: { label: 'Signed out', icon: LogOut, tone: 'text-muted-foreground' },
};

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function LoginActivityList({
  items,
  error,
  showAccount,
}: {
  items: LoginActivityItem[];
  error: string | null;
  showAccount: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent sign-in activity</CardTitle>
        <CardDescription>Latest authentication events recorded for this portal.</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sign-in activity has been recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const meta = EVENT_META[item.event] ?? EVENT_META.logout;
              const Icon = meta.icon;
              return (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <Icon className={`h-4 w-4 shrink-0 ${meta.tone}`} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {meta.label}
                      <span className="ml-2 text-xs font-normal uppercase tracking-wide text-muted-foreground">
                        {item.portal}
                      </span>
                    </p>
                    {showAccount && item.email ? (
                      <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                    ) : null}
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground" dateTime={item.createdAt}>
                    {timeFormatter.format(new Date(item.createdAt))}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
