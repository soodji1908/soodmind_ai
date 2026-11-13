import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/services/user-service';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'invalid_input', message: 'Email address is required.' }, { status: 422 });
  }

  const result = await requestPasswordReset(body.email);

  // Always return success to prevent email enumeration
  return NextResponse.json({
    ok: true,
    resetToken: process.env.NODE_ENV === 'development' ? result.token : undefined,
  });
}
