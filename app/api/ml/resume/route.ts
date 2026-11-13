import { NextResponse } from 'next/server';
import { resolvePortalAccess } from '@/lib/auth/access';
import { callMlService } from '@/lib/ml/client';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const JOB_DESCRIPTION_MIN = 30;
const JOB_DESCRIPTION_MAX = 50000;
const RESUME_TEXT_MAX = 200000;

function errorResponse(status: number, error: string, message: string) {
  return NextResponse.json({ error, message }, { status });
}

export async function POST(request: Request) {
  const access = await resolvePortalAccess('career');
  if (!access) {
    return errorResponse(403, 'forbidden', 'Sign in to CareerMind AI to analyse a resume.');
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return errorResponse(422, 'invalid_input', 'The resume request could not be read. Try again.');
  }

  const file = form.get('file');
  const resumeText = String(form.get('resume_text') ?? '').trim();
  const jobDescription = String(form.get('job_description') ?? '').trim();
  const outgoing = new FormData();

  let savedResumeText = '';

  if (file instanceof File && file.size > 0) {
    const lowerName = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((extension) => lowerName.endsWith(extension))) {
      return errorResponse(422, 'unsupported_file', 'Upload a PDF or DOCX resume.');
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return errorResponse(413, 'file_too_large', 'The resume file must be 10 MB or smaller.');
    }
    outgoing.append('file', file, file.name);
  } else if (resumeText.length > 0) {
    if (resumeText.length > RESUME_TEXT_MAX) {
      return errorResponse(422, 'resume_too_long', 'The resume text is too long to process.');
    }
    outgoing.append('resume_text', resumeText);
    savedResumeText = resumeText;
  } else {
    return errorResponse(422, 'missing_resume', 'Upload a PDF or DOCX resume, or paste the resume text.');
  }

  if (jobDescription.length > 0) {
    if (jobDescription.length < JOB_DESCRIPTION_MIN) {
      return errorResponse(422, 'job_too_short', 'Paste a fuller job description to compare against.');
    }
    if (jobDescription.length > JOB_DESCRIPTION_MAX) {
      return errorResponse(422, 'job_too_long', 'The job description is too long to process.');
    }
    outgoing.append('job_description', jobDescription);
  }

  const path = jobDescription.length > 0 ? '/api/ml/resume/match' : '/api/ml/resume/analyze';
  const result = await callMlService<Record<string, unknown>>(path, { method: 'POST', form: outgoing });

  if (!result.ok) {
    return errorResponse(result.status, result.error, result.message);
  }

  // Persist resume + analysis to MongoDB (best-effort)
  try {
    const { connectDB } = await import('@/lib/mongodb');
    const { Resume, ResumeAnalysis } = await import('@/lib/models');
    await connectDB();
    const uploadedFile = file instanceof File && file.size > 0 ? file : null;
    const responseData = result.data as Record<string, unknown>;
    const extractedText = typeof responseData.extracted_text === 'string'
      ? responseData.extracted_text
      : typeof responseData.resume_text === 'string'
        ? responseData.resume_text
        : '';
    const resume = await Resume.create({
      userId: access.userId,
      fileName: uploadedFile?.name || 'Pasted resume',
      fileType: uploadedFile
        ? (uploadedFile.name.split('.').pop() || uploadedFile.type || 'file').toLowerCase()
        : 'text',
      fileMimeType: uploadedFile?.type || undefined,
      fileData: uploadedFile ? Buffer.from(await uploadedFile.arrayBuffer()) : undefined,
      rawText: savedResumeText || extractedText || (uploadedFile ? `Original file uploaded: ${uploadedFile.name}. The analysis service did not return extracted text.` : ''),
      isActive: true,
    });
    const data = responseData;
    const ats = data.ats as { score: number; max_score: number; checks: Array<Record<string, unknown>> } | undefined;
    await ResumeAnalysis.create({
      resumeId: resume._id,
      userId: access.userId,
      atsScore: ats?.score ?? 0,
      maxScore: ats?.max_score ?? 0,
      checks: (ats?.checks ?? []).map((c) => ({
        id: String(c.id ?? ''),
        label: String(c.label ?? ''),
        passed: Boolean(c.passed),
        pointsAwarded: Number(c.points_awarded ?? 0),
        maxPoints: Number(c.max_points ?? 0),
        explanation: String(c.explanation ?? ''),
      })),
      skills: (data.skills as string[]) ?? [],
      sectionsFound: (data.sections_found as string[]) ?? [],
      wordCount: Number(data.word_count ?? 0),
      experienceYears: (data.experience as { years_estimated?: number })?.years_estimated ?? null,
      jobMatch: data.job_match as { similarity: number; matchedSkills: string[]; missingSkills: string[]; keywordGaps: string[] } | undefined,
    });
  } catch (error) {
    console.error('[resume:persist]', error);
    return errorResponse(503, 'persistence_failed', 'Resume analysis completed, but it could not be saved to your Resume Library. Check the database connection and try again.');
  }

  return NextResponse.json(result.data);
}
