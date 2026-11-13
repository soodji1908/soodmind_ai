import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, clearSessionCookie, destroySessionRecord } from '@/lib/services/session';
import { recordLoginEvent } from '@/lib/auth/login-activity';

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request);

  if (session) {
    await destroySessionRecord(getTokenFromRequest(request));
    if (session.userId) {
      await recordLoginEvent(session.userId, session.portal, 'logout', request.headers.get('user-agent') ?? undefined);
    }
  }

  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

function getTokenFromRequest(request: NextRequest): string {
  return request.cookies.get('em_session')?.value ?? '';
}
