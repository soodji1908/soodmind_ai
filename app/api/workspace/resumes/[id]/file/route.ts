import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromCookies } from '@/lib/services/session';
import { resolvePortalAccess } from '@/lib/auth/access';
import { Resume } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.portal !== 'career') {
      return NextResponse.json({ message: 'Sign in to CareerMind AI to access this resume.' }, { status: 401 });
    }
    const access = await resolvePortalAccess('career');
    if (!access) return NextResponse.json({ message: 'You do not have permission to access this resume.' }, { status: 403 });
    if (!mongoose.isValidObjectId(context.params.id)) {
      return NextResponse.json({ message: 'Invalid resume ID.' }, { status: 400 });
    }

    await connectDB();
    const resume = await Resume.findOne({ _id: context.params.id, userId: access.userId, isActive: true })
      .select('+fileData')
      .lean();

    if (!resume) return NextResponse.json({ message: 'Resume not found.' }, { status: 404 });
    if (!resume.fileData) return NextResponse.json({ message: 'No original file is stored for this resume. You can still view its saved text in the library.' }, { status: 404 });

    const fileName = String(resume.fileName || 'resume');
    const safeName = fileName.replace(/[\r\n"]/g, '_');
    const mimeType = String(resume.fileMimeType || 'application/octet-stream');
    const fileBuffer = Buffer.from(resume.fileData as unknown as Uint8Array);
    const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(fileBuffer.byteLength),
        'Content-Disposition': `${isPdf ? 'inline' : 'attachment'}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[resume:file]', error);
    return NextResponse.json({ message: 'Could not open this resume file.' }, { status: 500 });
  }
}
