import { LoginPage } from '@/components/shared/auth/login-page';

export default function EstateLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return <LoginPage portal="estate" errorCode={searchParams.error} />;
}
