export const dynamic = 'force-dynamic';

import { ResumeAnalyzer } from '@/components/career/resume-analyzer';
import { MemberOverview } from '@/components/shared/portal/member-overview';

export default function CareerDashboardPage() {
  return (
    <div className="space-y-8">
      <MemberOverview portal="career" />
      <ResumeAnalyzer />
    </div>
  );
}
