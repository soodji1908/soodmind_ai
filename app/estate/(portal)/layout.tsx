import { PortalLayout } from '@/components/shared/portal/portal-layout';

export default function EstatePortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout portal="estate">{children}</PortalLayout>;
}
