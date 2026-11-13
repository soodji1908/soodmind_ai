import { LoginPage } from '@/components/shared/auth/login-page';

export default function CareerLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return <LoginPage portal="career" errorCode={searchParams.error} />;
}
