import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/services/user-service';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.token !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'invalid_input', message: 'Reset token and new password are required.' }, { status: 422 });
  }

  const result = await resetPassword(body.token, body.password);
  if (!result.ok) {
    return NextResponse.json({ error: 'reset_failed', message: result.error ?? 'Reset failed.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
