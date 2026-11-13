import { BadgeCheck, CalendarDays, Sparkles, UserRound } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import { User, Resume, JobApplication, InterviewSession, JobVacancy, SupportTicket, Property, Lead, Appointment, PropertyEnquiry } from '@/lib/models';
import { getRecentLoginActivity } from '@/lib/auth/activity-queries';
import { getPortalRoleLabel, PORTALS, type PortalKey } from '@/lib/auth/portals';
import { requirePortalAccess } from '@/lib/auth/require-portal';
import { LoginActivityList } from './login-activity-list';
import { StatCard } from './stat-card';
import { PORTAL_THEMES } from './portal-theme';
import { AIAssistant } from '@/components/shared/ai-assistant';

const MEMBER_COPY: Record<Exclude<PortalKey, 'admin'>, { heading: string; upcoming: string }> = {
  estate: {
    heading: 'Your property workspace',
    upcoming: 'Your property portfolio, leads, appointments and enquiries are shown in the Estate dashboard using your saved workspace records.',
  },
  career: {
    heading: 'Your career workspace',
    upcoming: 'Live counts below are calculated from your saved resumes, job applications and interview sessions.',
  },
  recruiter: {
    heading: 'Your hiring workspace',
    upcoming: 'Live counts below are calculated from your published vacancies and support requests.',
  },
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' });

export async function MemberOverview({ portal }: { portal: Exclude<PortalKey, 'admin'> }) {
  const { access } = await requirePortalAccess(portal);
  await connectDB();
  const theme = PORTAL_THEMES[portal];
  const copy = MEMBER_COPY[portal];

  const [user, activity, liveCounts] = await Promise.all([
    User.findById(access.userId).select('fullName createdAt').lean(),
    getRecentLoginActivity(8),
    portal === 'estate'
      ? Promise.all([Property.countDocuments({ ownerUserId: access.userId, deletedAt: null }), Lead.countDocuments({ agentId: access.userId }), Appointment.countDocuments({ agentId: access.userId }), PropertyEnquiry.countDocuments({ userId: access.userId })]).then(([properties, leads, appointments, enquiries]) => [{ label: 'My properties', value: properties }, { label: 'My leads', value: leads }, { label: 'Appointments', value: appointments }, { label: 'Enquiries', value: enquiries }])
      : portal === 'career'
        ? Promise.all([Resume.countDocuments({ userId: access.userId }), JobApplication.countDocuments({ userId: access.userId }), InterviewSession.countDocuments({ userId: access.userId })]).then(([resumes, applications, interviews]) => [{ label: 'Saved resumes', value: resumes }, { label: 'Job applications', value: applications }, { label: 'Interview sessions', value: interviews }])
        : Promise.all([JobVacancy.countDocuments({ recruiterId: access.userId }), JobVacancy.countDocuments({ recruiterId: access.userId, status: 'active' }), SupportTicket.countDocuments({ userId: access.userId, status: { $in: ['open', 'in_progress'] } })]).then(([jobs, activeJobs, tickets]) => [{ label: 'Total vacancies', value: jobs }, { label: 'Active vacancies', value: activeJobs }, { label: 'Open support tickets', value: tickets }]),
  ]);

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const memberSince = user?.createdAt ? dateFormatter.format(new Date(user.createdAt)) : 'Not available';

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className={`text-sm font-semibold uppercase tracking-[0.14em] ${theme.accentText}`}>
          {PORTALS[portal].name}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{copy.heading}.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Portal role"
          value={getPortalRoleLabel(portal, access.role)}
          icon={UserRound}
          accentClassName={theme.accentSurface}
        />
        <StatCard
          label="Access status"
          value="Active"
          hint="Your membership grants access to this portal"
          icon={BadgeCheck}
          accentClassName={theme.accentSurface}
        />
        <StatCard
          label="Member since"
          value={memberSince}
          icon={CalendarDays}
          accentClassName={theme.accentSurface}
        />
        {liveCounts.map((metric) => <StatCard key={metric.label} label={metric.label} value={metric.value.toLocaleString('en-IN')} icon={CalendarDays} accentClassName={theme.accentSurface} />)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col justify-between rounded-2xl border border-dashed border-border bg-card p-8 shadow-sm">
          <div className="space-y-4">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.accentSurface}`}>
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Your live workspace activity</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{copy.upcoming}</p>
            </div>
          </div>
        </div>

        <LoginActivityList items={activity.items} error={activity.error} showAccount={false} />
      </section>
      <AIAssistant />
    </div>
  );
}
