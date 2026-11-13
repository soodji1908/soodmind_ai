import { PortalShell } from './portal-shell';
import { requirePortalAccess } from '@/lib/auth/require-portal';
import { getPortalRoleLabel, type PortalKey } from '@/lib/auth/portals';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { getPlatformSetting } from '@/lib/platform-settings';

export async function PortalLayout({ portal, children }: { portal: PortalKey; children: React.ReactNode }) {
  const { access } = await requirePortalAccess(portal);

  await connectDB();
  const user = await User.findById(access.userId).select('fullName email').lean();

  const announcement = portal === 'admin' ? '' : await getPlatformSetting<string>('platformAnnouncement', '');
  const email = user?.email ?? '';
  const displayName = user?.fullName || email || 'Member';

  return (
    <PortalShell
      portal={portal}
      displayName={displayName}
      email={email}
      roleLabel={getPortalRoleLabel(portal, access.role)}
    >
      {announcement ? <div className="mb-5 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-950 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-100">{announcement}</div> : null}
      {children}
    </PortalShell>
  );
}
