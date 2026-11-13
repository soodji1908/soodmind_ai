import { AuthShell } from '@/components/shared/auth/auth-shell';
import { ForgotPasswordForm } from '@/components/shared/auth/forgot-password-form';

export default function CareerForgotPasswordPage() {
  return (
    <AuthShell
      portal="career"
      title="Reset your password"
      subtitle="Enter the email address on your account and we will send you a secure reset link."
    >
      <ForgotPasswordForm portal="career" />
    </AuthShell>
  );
}
