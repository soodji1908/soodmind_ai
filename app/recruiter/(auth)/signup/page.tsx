import { AuthShell } from '@/components/shared/auth/auth-shell';
import { SignupForm } from '@/components/shared/auth/signup-form';
import { PORTALS } from '@/lib/auth/portals';

export default function RecruiterSignupPage() {
  return (
    <AuthShell
      portal="recruiter"
      title="Create your recruiter account"
      subtitle="Post vacancies, rank candidates and manage your hiring pipeline."
      footer={
        <p>
          Already registered?{' '}
          <a href={PORTALS.recruiter.loginPath} className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </a>
        </p>
      }
    >
      <SignupForm portal="recruiter" />
    </AuthShell>
  );
}
