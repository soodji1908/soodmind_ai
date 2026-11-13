import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accentClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accentClassName: string;
}) {
  return (
    <Card className="group shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClassName}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
