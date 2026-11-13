'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PORTALS, type PortalKey } from '@/lib/auth/portals';
import { PORTAL_THEMES } from '@/components/shared/portal/portal-theme';
import { friendlyAuthError } from './auth-errors';

const MIN_PASSWORD_LENGTH = 8;

export function SignupForm({ portal }: { portal: PortalKey }) {
  const config = PORTALS[portal];
  const theme = PORTAL_THEMES[portal];
  const roles = config.signupRoles;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[0]?.value ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (fullName.trim().length < 2) {
      setFormError('Enter your full name.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
      return;
    }
    if (password !== confirmPassword) {
      setFormError('The passwords do not match.');
      return;
    }
    if (!role) {
      setFormError('Choose the role that best describes you.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, fullName: fullName.trim(), portal, role }),
      });
      const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; message?: string } | null;

      if (!response.ok || !body?.ok) {
        setFormError(friendlyAuthError(body?.message ?? body?.error));
        return;
      }

      window.location.assign(config.dashboardPath);
    } catch {
      setFormError('We could not reach the sign-up service. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor={`${portal}-signup-name`}>Full name</Label>
        <Input
          id={`${portal}-signup-name`}
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={120}
          className="h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${portal}-signup-email`}>Email address</Label>
        <Input
          id={`${portal}-signup-email`}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="h-11"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${portal}-signup-role`}>I am a</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id={`${portal}-signup-role`} className="h-11">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${portal}-signup-password`}>Password</Label>
          <div className="relative">
            <Input
              id={`${portal}-signup-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 pr-11"
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
        <div className="space-y-2">
          <Label htmlFor={`${portal}-signup-confirm`}>Confirm password</Label>
          <Input
            id={`${portal}-signup-confirm`}
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="h-11"
            required
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Use at least {MIN_PASSWORD_LENGTH} characters.</p>

      <Button
        type="submit"
        disabled={submitting}
        className={`h-11 w-full text-sm font-medium shadow-sm transition-all duration-200 hover:shadow-md ${theme.primaryButton}`}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}
