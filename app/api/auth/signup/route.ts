import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/user-service';
import { setSessionCookie, createSessionRecord } from '@/lib/services/session';
import { recordLoginEvent } from '@/lib/auth/login-activity';
import { PORTAL_ROLES, type PortalKey } from '@/lib/models/PortalMembership';
import { connectDB } from '@/lib/mongodb';
import { getPlatformSetting } from '@/lib/platform-settings';

const SIGNUP_PORTALS: PortalKey[] = ['estate', 'career', 'recruiter'];

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    if (!(await getPlatformSetting<boolean>('allowPublicSignup', true))) return NextResponse.json({ error: 'registration_disabled', message: 'New registrations are temporarily disabled. Please contact support.' }, { status: 403 });
    const body = await request.json().catch(() => null);
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || typeof body.portal !== 'string') {
      return NextResponse.json({ error: 'invalid_input', message: 'Email, password and portal are required.' }, { status: 422 });
    }

    const portal = body.portal as PortalKey;
    if (!SIGNUP_PORTALS.includes(portal)) {
      return NextResponse.json({ error: 'invalid_portal', message: 'This portal does not allow self-service registration.' }, { status: 422 });
    }

    const role = typeof body.role === 'string' ? body.role : PORTAL_ROLES[portal]?.[0] ?? '';
    const fullName = typeof body.fullName === 'string' ? body.fullName : '';
    const result = await registerUser({ email: body.email, password: body.password, fullName, portal, role });

    if (!result.ok) {
      return NextResponse.json({ error: result.error, message: result.message }, { status: 400 });
    }

    await createSessionRecord(result.userId, portal, result.token, request.headers.get('user-agent') ?? undefined);
    await setSessionCookie(result.token);
    await recordLoginEvent(result.userId, portal, 'login_success', request.headers.get('user-agent') ?? undefined);
    return NextResponse.json({ ok: true, portal, redirectTo: `/${portal}/dashboard` });
  } catch (error) {
    console.error('[auth/signup]', error);
    return NextResponse.json({ error: 'service_unavailable', message: 'Sign-up is temporarily unavailable. Check the database configuration and try again.' }, { status: 503 });
  }
}
