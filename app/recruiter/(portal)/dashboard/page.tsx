export const dynamic = 'force-dynamic';

import { MemberOverview } from '@/components/shared/portal/member-overview';

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-8">
      <MemberOverview portal="recruiter" />
    </div>
  );
}
