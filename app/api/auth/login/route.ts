import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/services/user-service';
import { setSessionCookie } from '@/lib/services/session';
import { recordLoginEvent } from '@/lib/auth/login-activity';
import { type PortalKey } from '@/lib/models/PortalMembership';

const VALID_PORTALS: PortalKey[] = ['estate', 'career', 'admin', 'recruiter'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || typeof body.portal !== 'string') {
      return NextResponse.json({ error: 'invalid_input', message: 'Email, password and portal are required.' }, { status: 422 });
    }

    const portal = body.portal as PortalKey;
    if (!VALID_PORTALS.includes(portal)) {
      return NextResponse.json({ error: 'invalid_portal', message: 'Unknown portal.' }, { status: 422 });
    }

    const result = await loginUser(body.email, body.password, portal, request.headers.get('user-agent') ?? undefined);
    if (!result.ok) {
      if (result.error === 'no_access' && body.recordDenied !== false) {
        await recordLoginEventByPortal(portal, 'login_denied');
      }
      return NextResponse.json({ error: result.error, message: result.message }, { status: 401 });
    }

    await createLoginSession(result.token, result.userId, portal, request);
    return NextResponse.json({ ok: true, portal: result.portal, redirectTo: `/${result.portal}/dashboard` });
  } catch (error) {
    console.error('[auth/login]', error);
    return NextResponse.json({ error: 'service_unavailable', message: 'Sign-in is temporarily unavailable. Check the database configuration and try again.' }, { status: 503 });
  }
}

async function createLoginSession(token: string, userId: string, portal: PortalKey, request: NextRequest) {
  await setSessionCookie(token);
  await recordLoginEvent(userId, portal, 'login_success', request.headers.get('user-agent') ?? undefined);
}

async function recordLoginEventByPortal(_portal: string, _event: 'login_denied') {
  // Login denied events without a known user are tracked via the user's session
  // when we can identify them. For now, we skip anonymous denials.
}
