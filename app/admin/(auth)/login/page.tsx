import { LoginPage } from '@/components/shared/auth/login-page';

export default function AdminLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return <LoginPage portal="admin" errorCode={searchParams.error} />;
}
