import { PortalLayout } from '@/components/shared/portal/portal-layout';

export default function CareerPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout portal="career">{children}</PortalLayout>;
}
