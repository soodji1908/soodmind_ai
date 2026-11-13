import { PortalLayout } from '@/components/shared/portal/portal-layout';

export default function RecruiterPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout portal="recruiter">{children}</PortalLayout>;
}
