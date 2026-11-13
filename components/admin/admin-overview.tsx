import { Activity, ShieldAlert, ShieldCheck, Users, UserX, Building2, GraduationCap, Briefcase } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import { User, PortalMembership, UserRole, LoginActivity, Property, Lead, JobVacancy, Subscription, SupportTicket } from '@/lib/models';
import { getRecentLoginActivity } from '@/lib/auth/activity-queries';
import { PORTAL_THEMES } from '@/components/shared/portal/portal-theme';
import { LoginActivityList } from '@/components/shared/portal/login-activity-list';
import { StatCard } from '@/components/shared/portal/stat-card';
import { AdminOverviewCharts } from './admin-overview-charts';
import { AIAssistant } from '@/components/shared/ai-assistant';

const numberFormatter = new Intl.NumberFormat('en-IN');

export async function AdminOverview() {
  await connectDB();
  const theme = PORTAL_THEMES.admin;

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    estateMembers,
    careerMembers,
    recruiterMembers,
    administrators,
    suspendedMemberships,
    loginsLast24h,
    deniedLoginsLast24h,
    totalProperties,
    totalLeads,
    totalJobs,
    activeSubscriptions,
    openTickets,
    activity,
  ] = await Promise.all([
    User.countDocuments(),
    PortalMembership.countDocuments({ portal: 'estate' }),
    PortalMembership.countDocuments({ portal: 'career' }),
    PortalMembership.countDocuments({ portal: 'recruiter' }),
    UserRole.countDocuments({ role: 'super_admin' }),
    PortalMembership.countDocuments({ status: 'suspended' }),
    LoginActivity.countDocuments({ event: 'login_success', createdAt: { $gt: twentyFourHoursAgo } }),
    LoginActivity.countDocuments({ event: 'login_denied', createdAt: { $gt: twentyFourHoursAgo } }),
    Property.countDocuments({ deletedAt: null }),
    Lead.countDocuments(),
    JobVacancy.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ status: 'active' }),
    SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    getRecentLoginActivity(15),
  ]);

  const fmt = (n: number) => numberFormatter.format(n);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-400">
          Platform control center
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Ecosystem overview</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Live counts from the database, refreshed each time this page loads.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total platform users" value={fmt(totalUsers)} icon={Users} accentClassName={theme.accentSurface} />
        <StatCard label="EstateMind members" value={fmt(estateMembers)} icon={Building2} accentClassName={theme.accentSurface} />
        <StatCard label="CareerMind members" value={fmt(careerMembers)} icon={GraduationCap} accentClassName={theme.accentSurface} />
        <StatCard label="Recruiter members" value={fmt(recruiterMembers)} icon={Briefcase} accentClassName={theme.accentSurface} />
        <StatCard label="Administrators" value={fmt(administrators)} icon={ShieldCheck} accentClassName={theme.accentSurface} />
        <StatCard label="Sign-ins (24 hours)" value={fmt(loginsLast24h)} icon={Activity} accentClassName={theme.accentSurface} />
        <StatCard label="Denied sign-ins (24 hours)" value={fmt(deniedLoginsLast24h)} icon={ShieldAlert} accentClassName={theme.accentSurface} />
        <StatCard label="Suspended memberships" value={fmt(suspendedMemberships)} icon={UserX} accentClassName={theme.accentSurface} />
        <StatCard label="Property inventory" value={fmt(totalProperties)} icon={Building2} accentClassName={theme.accentSurface} />
        <StatCard label="CRM leads" value={fmt(totalLeads)} icon={Users} accentClassName={theme.accentSurface} />
        <StatCard label="Active job vacancies" value={fmt(totalJobs)} icon={Briefcase} accentClassName={theme.accentSurface} />
        <StatCard label="Active subscriptions" value={fmt(activeSubscriptions)} icon={Activity} accentClassName={theme.accentSurface} />
        <StatCard label="Open support tickets" value={fmt(openTickets)} icon={ShieldAlert} accentClassName={theme.accentSurface} />
      </section>

      <AdminOverviewCharts portals={[{portal:'Estate',members:estateMembers},{portal:'Career',members:careerMembers},{portal:'Recruiter',members:recruiterMembers}]} operations={[{name:'Properties',count:totalProperties},{name:'Leads',count:totalLeads},{name:'Active jobs',count:totalJobs},{name:'Subscriptions',count:activeSubscriptions},{name:'Open tickets',count:openTickets}]}/>
      <LoginActivityList items={activity.items} error={activity.error} showAccount />
      <AIAssistant />
    </div>
  );
}
