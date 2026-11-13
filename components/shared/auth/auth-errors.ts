export function friendlyAuthError(message?: string): string {
  const normalized = (message ?? '').toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'The email address or password is incorrect.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Too many attempts. Wait a few minutes and try again.';
  }
  if (normalized.includes('password')) {
    return message ?? 'The password does not meet the requirements.';
  }
  return 'Something went wrong. Please try again.';
}
