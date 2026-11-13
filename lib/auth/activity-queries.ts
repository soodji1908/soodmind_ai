import { connectDB } from '@/lib/mongodb';
import { LoginActivity, User } from '@/lib/models';

export type LoginActivityItem = {
  id: string;
  portal: string;
  event: string;
  createdAt: string;
  email: string | null;
};

export async function getRecentLoginActivity(
  limit: number,
): Promise<{ items: LoginActivityItem[]; error: string | null }> {
  try {
    await connectDB();
    const activities = await LoginActivity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const userIds = Array.from(new Set(activities.map((a) => a.userId.toString())));
    const users = await User.find({ _id: { $in: userIds } }).select('email').lean();
    const emailById = new Map<string, string>();
    users.forEach((u) => emailById.set(u._id.toString(), u.email));

    return {
      items: activities.map((a) => ({
        id: a._id.toString(),
        portal: a.portal,
        event: a.event,
        createdAt: a.createdAt.toISOString(),
        email: emailById.get(a.userId.toString()) ?? null,
      })),
      error: null,
    };
  } catch {
    return { items: [], error: 'Recent sign-in activity could not be loaded.' };
  }
}
