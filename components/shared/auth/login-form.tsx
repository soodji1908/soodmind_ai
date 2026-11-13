'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PORTALS, type PortalKey } from '@/lib/auth/portals';
import { PORTAL_THEMES } from '@/components/shared/portal/portal-theme';

const ERROR_MESSAGES: Record<string, string> = {
  'no-access': 'This account does not have access to this portal.',
  'session-expired': 'Your session has ended. Please sign in again.',
  'link-invalid': 'This link is invalid or has expired. Request a new one and try again.',
};

export function LoginForm({ portal, errorCode }: { portal: PortalKey; errorCode?: string }) {
  const router = useRouter();
  const config = PORTALS[portal];
  const theme = PORTAL_THEMES[portal];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    errorCode && ERROR_MESSAGES[errorCode] ? ERROR_MESSAGES[errorCode] : null,
  );

  const deniedMessage =
    portal === 'admin'
      ? 'This account does not have Super Administrator access.'
      : `This account does not have access to ${config.name}. Sign in with the portal you registered for.`;

  async function handleSwitchAccount() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setFormError(null);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError('Enter your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, portal }),
      });
      const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; message?: string; redirectTo?: string } | null;

      if (!response.ok || !body?.ok) {
        const msg = body?.message ?? 'The email address or password is incorrect.';
        if (body?.error === 'no_access') {
          setFormError(deniedMessage);
        } else {
          setFormError(msg);
        }
        return;
      }

      // A full document navigation avoids stale App Router state after the
      // HttpOnly session cookie is set by the login API.
      window.location.assign(body.redirectTo || config.dashboardPath);
    } catch {
      setFormError('We could not reach the sign-in service. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            {formError}
            {formError === deniedMessage ? (
              <button type="button" onClick={() => void handleSwitchAccount()} className="mt-2 block font-medium underline underline-offset-4">
                Sign out and use a different account
              </button>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${portal}-login-email`}>Email address</Label>
        <Input
          id={`${portal}-login-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={`h-11 ${theme.focusRing}`}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${portal}-login-password`}>Password</Label>
          {portal !== 'admin' ? (
            <Link
              href={`${config.basePath}/forgot-password`}
              className={`text-xs font-medium hover:underline ${theme.accentText}`}
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <div className="relative">
          <Input
            id={`${portal}-login-password`}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`h-11 pr-11 ${theme.focusRing}`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className={`h-11 w-full text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md ${theme.primaryButton}`}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}
