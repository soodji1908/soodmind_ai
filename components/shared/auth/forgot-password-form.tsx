'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PORTALS, type PortalKey } from '@/lib/auth/portals';
import { PORTAL_THEMES } from '@/components/shared/portal/portal-theme';

export function ForgotPasswordForm({ portal }: { portal: PortalKey }) {
  const config = PORTALS[portal];
  const theme = PORTAL_THEMES[portal];

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setFormError('Enter the email address linked to your account.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      if (response.status === 429) {
        setFormError('Too many reset requests. Wait a few minutes before trying again.');
        return;
      }

      setSentTo(trimmed);
    } catch {
      setFormError('We could not reach the reset service. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sentTo) {
    return (
      <div className="space-y-6">
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
          <MailCheck className="h-4 w-4" />
          <AlertDescription>
            If an account exists for {sentTo}, a password reset link is on its way. The link expires after one hour.
          </AlertDescription>
        </Alert>
        <Link
          href={config.loginPath}
          className={`inline-flex items-center gap-2 text-sm font-medium hover:underline ${theme.accentText}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
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
        <Label htmlFor={`${portal}-forgot-email`}>Email address</Label>
        <Input
          id={`${portal}-forgot-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
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
            Sending link
          </>
        ) : (
          'Send reset link'
        )}
      </Button>

      <Link
        href={config.loginPath}
        className={`inline-flex items-center gap-2 text-sm font-medium hover:underline ${theme.accentText}`}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </form>
  );
}
