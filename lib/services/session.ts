import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  COOKIE_OPTIONS,
  verifySessionToken,
  hashToken,
  type SessionPayload,
} from './auth';
import { connectDB } from '@/lib/mongodb';
import { Session } from '@/lib/models/Session';

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return validateSession(token);
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function validateSession(token: string): Promise<SessionPayload | null> {
  const payload = verifySessionToken(token);
  if (!payload) return null;

  await connectDB();
  const tokenHash = hashToken(token);
  const session = await Session.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
  if (!session) return null;

  return payload;
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, token, COOKIE_OPTIONS);
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function createSessionRecord(
  userId: string,
  portal: string,
  token: string,
  userAgent?: string,
) {
  await connectDB();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    userId,
    tokenHash,
    portal,
    userAgent: userAgent?.slice(0, 300),
    expiresAt,
  });
}

export async function destroySessionRecord(token: string) {
  await connectDB();
  const tokenHash = hashToken(token);
  await Session.deleteOne({ tokenHash });
}
