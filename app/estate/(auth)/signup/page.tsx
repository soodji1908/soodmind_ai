import { AuthShell } from '@/components/shared/auth/auth-shell';
import { SignupForm } from '@/components/shared/auth/signup-form';
import { PORTALS } from '@/lib/auth/portals';

export default function EstateSignupPage() {
  return (
    <AuthShell
      portal="estate"
      title="Create your account"
      subtitle="Choose the role that describes you best. Your access will be limited to EstateMind."
      footer={
        <p>
          Already registered?{' '}
          <a href={PORTALS.estate.loginPath} className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </a>
        </p>
      }
    >
      <SignupForm portal="estate" />
    </AuthShell>
  );
}
