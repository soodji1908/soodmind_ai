import { connectDB } from '@/lib/mongodb';
import { PortalMembership, UserRole, User } from '@/lib/models';
import { validateSession } from '@/lib/services/session';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/services/auth';
import type { PortalKey } from '@/lib/models/PortalMembership';

export type PortalAccess = {
  userId: string;
  role: string;
  portal: PortalKey;
};

export async function resolvePortalAccess(portal: PortalKey): Promise<PortalAccess | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await validateSession(token);
  if (!session || session.portal !== portal) return null;

  await connectDB();

  const user = await User.findById(session.userId).select('isActive');
  if (!user || !user.isActive) return null;

  if (portal === 'admin') {
    const adminRole = await UserRole.findOne({ userId: session.userId, role: 'super_admin' });
    if (!adminRole) return null;
    return { userId: session.userId, role: 'super_admin', portal };
  }

  const membership = await PortalMembership.findOne({
    userId: session.userId,
    portal,
    status: 'active',
  });

  if (!membership) return null;

  return {
    userId: session.userId,
    role: membership.role,
    portal,
  };
}
