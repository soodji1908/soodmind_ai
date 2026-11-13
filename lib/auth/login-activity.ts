import type { PortalKey } from '@/lib/models/PortalMembership';

export type LoginEvent = 'login_success' | 'login_denied' | 'logout';

export async function recordLoginEvent(
  userId: string,
  portal: string,
  event: LoginEvent,
  userAgent?: string,
): Promise<string | null> {
  try {
    const { connectDB } = await import('@/lib/mongodb');
    const { LoginActivity } = await import('@/lib/models/LoginActivity');
    await connectDB();
    await LoginActivity.create({
      userId,
      portal,
      event,
      userAgent: userAgent?.slice(0, 300),
    });
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : 'Failed to record login event';
  }
}
