import { AuthShell } from '@/components/shared/auth/auth-shell';
import { SignupForm } from '@/components/shared/auth/signup-form';
import { PORTALS } from '@/lib/auth/portals';

export default function CareerSignupPage() {
  return (
    <AuthShell
      portal="career"
      title="Create your account"
      subtitle="Tell us your role so CareerMind AI can tailor your workspace."
      footer={
        <p>
          Already registered?{' '}
          <a href={PORTALS.career.loginPath} className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </a>
        </p>
      }
    >
      <SignupForm portal="career" />
    </AuthShell>
  );
}
