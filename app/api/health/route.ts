import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    await mongoose.connection.db?.admin().ping();
    return NextResponse.json({ ok: true, status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[health]', error);
    return NextResponse.json({ ok: false, status: 'degraded', database: 'unavailable', timestamp: new Date().toISOString() }, { status: 503 });
  }
}
