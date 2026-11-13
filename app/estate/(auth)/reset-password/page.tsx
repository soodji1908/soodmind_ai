import { AuthShell } from '@/components/shared/auth/auth-shell';
import { ResetPasswordForm } from '@/components/shared/auth/reset-password-form';

export default function EstateResetPasswordPage() {
  return (
    <AuthShell portal="estate" title="Choose a new password" subtitle="Set a new password for your EstateMind account.">
      <ResetPasswordForm portal="estate" />
    </AuthShell>
  );
}
