'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PORTALS, type PortalKey } from '@/lib/auth/portals';
import { PORTAL_THEMES } from '@/components/shared/portal/portal-theme';

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordForm({ portal }: { portal: PortalKey }) {
  const searchParams = useSearchParams();
  const config = PORTALS[portal];
  const theme = PORTAL_THEMES[portal];

  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);

  if (!token) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>This reset link is invalid or has expired. Request a new one.</AlertDescription>
        </Alert>
        <Link
          href={`${config.basePath}/forgot-password`}
          className={`text-sm font-medium hover:underline ${theme.accentText}`}
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your new password.`);
      return;
    }
    if (password !== confirmPassword) {
      setFormError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

      if (!response.ok || !body?.ok) {
        setFormError(body?.message ?? 'We could not update your password. Check your connection and try again.');
        return;
      }

      setUpdated(true);
      window.location.assign(config.loginPath);
    } catch {
      setFormError('We could not update your password. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (updated) {
    return (
      <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>Your password has been updated. Please sign in with your new password.</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${portal}-reset-password`}>New password</Label>
        <Input
          id={`${portal}-reset-password`}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${portal}-reset-confirm`}>Confirm new password</Label>
        <Input
          id={`${portal}-reset-confirm`}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="h-11"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className={`h-11 w-full text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md ${theme.primaryButton}`}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating password
          </>
        ) : (
          'Set new password'
        )}
      </Button>
    </form>
  );
}
