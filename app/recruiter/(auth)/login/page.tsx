import { LoginPage } from '@/components/shared/auth/login-page';

export default function RecruiterLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return <LoginPage portal="recruiter" errorCode={searchParams.error} />;
}
