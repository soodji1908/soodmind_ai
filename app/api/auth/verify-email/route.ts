import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/services/user-service';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.token !== 'string') {
    return NextResponse.json({ error: 'invalid_input', message: 'Verification token is required.' }, { status: 422 });
  }

  const result = await verifyEmail(body.token);
  if (!result.ok) {
    return NextResponse.json({ error: 'verify_failed', message: result.error ?? 'Verification failed.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
