import { EstateInsights } from '@/components/estate/estate-insights';
export const dynamic='force-dynamic';
export default function EstateInsightsPage(){return <div className="space-y-5"><header><p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Estate analytics</p><h1 className="mt-2 text-3xl font-semibold">Portfolio insights</h1><p className="mt-2 text-sm text-muted-foreground">Track inventory, portfolio value, lead activity and property locations.</p></header><EstateInsights fullDashboard/></div>}
