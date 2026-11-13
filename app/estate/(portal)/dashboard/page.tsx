export const dynamic = 'force-dynamic';

import { EstateMarketplace } from '@/components/estate/estate-marketplace';
import { PriceEstimator } from '@/components/estate/price-estimator';
import { MemberOverview } from '@/components/shared/portal/member-overview';
import { EstateInsights } from '@/components/estate/estate-insights';

export default function EstateDashboardPage() {
  return (
    <div className="space-y-8">
      <EstateMarketplace />
      <MemberOverview portal="estate" />
      <EstateInsights />
      <PriceEstimator />
    </div>
  );
}
