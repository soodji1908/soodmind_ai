import { verifySessionToken, SESSION_COOKIE, type SessionPayload } from './auth';

export function getSessionFromRequest(request: {
  cookies: { get(name: string): { value: string } | undefined };
}): SessionPayload | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
