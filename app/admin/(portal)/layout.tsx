import { PortalLayout } from '@/components/shared/portal/portal-layout';

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout portal="admin">{children}</PortalLayout>;
}
