import { AuthShell } from '@/components/shared/auth/auth-shell';
import { ResetPasswordForm } from '@/components/shared/auth/reset-password-form';

export default function CareerResetPasswordPage() {
  return (
    <AuthShell portal="career" title="Choose a new password" subtitle="Set a new password for your CareerMind AI account.">
      <ResetPasswordForm portal="career" />
    </AuthShell>
  );
}
