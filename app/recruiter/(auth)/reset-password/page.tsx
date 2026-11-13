import { AuthShell } from '@/components/shared/auth/auth-shell';
import { ResetPasswordForm } from '@/components/shared/auth/reset-password-form';

export default function RecruiterResetPasswordPage() {
  return (
    <AuthShell portal="recruiter" title="Choose a new password" subtitle="Set a new password for your Recruiter account.">
      <ResetPasswordForm portal="recruiter" />
    </AuthShell>
  );
}
