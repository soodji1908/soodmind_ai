
'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  FileText,
  FileDown,
  Eye,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  Upload,
  Target,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type AtsCheck = {
  id: string;
  label: string;
  passed: boolean;
  points_awarded: number;
  max_points: number;
  explanation: string;
};

type ResumeReport = {
  word_count: number;
  skills: string[];
  sections_found: string[];
  experience: { years_estimated: number | null };
  ats: {
    score: number;
    max_score: number;
    checks: AtsCheck[];
    method: string;
  };
  job_match: {
    similarity: number;
    matched_skills: string[];
    missing_skills: string[];
    keyword_gaps: string[];
  } | null;
  extracted_text?: string;
  resume_text?: string;
};

type ErrorBody = {
  error?: string;
  message?: string;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function getContactDetails(text: string) {
  const email = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  )?.[0] ?? null;

  const phone = text.match(
    /(?:\+?\d{1,3}[\s.-]?)?(?:\d[\s.-]?){9,12}\d/
  )?.[0]?.trim() ?? null;

  return { email, phone };
}

export function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ResumeReport | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setOriginalUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const extractedText = report?.extracted_text || report?.resume_text || resumeText;

  const contacts = useMemo(
    () => getContactDetails(extractedText || ''),
    [extractedText]
  );

  const scorePercentage = report?.ats.max_score
    ? Math.min(
        100,
        Math.max(0, (report.ats.score / report.ats.max_score) * 100)
      )
    : 0;

  const scoreLabel =
    scorePercentage >= 80
      ? 'Excellent'
      : scorePercentage >= 60
        ? 'Good'
        : scorePercentage >= 40
          ? 'Needs Improvement'
          : 'Needs Attention';

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    if (selected && selected.size > MAX_FILE_BYTES) {
      setError('The resume file must be 10 MB or smaller.');
      event.target.value = '';
      setFile(null);
      return;
    }

    if (selected) {
      const extension = selected.name.toLowerCase();
      if (!extension.endsWith('.pdf') && !extension.endsWith('.docx')) {
        setError('Only PDF and DOCX files are supported.');
        event.target.value = '';
        setFile(null);
        return;
      }
    }

    setError(null);
    setReport(null);
    setFile(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setReport(null);

    if (!file && resumeText.trim().length === 0) {
      setError('Upload a PDF or DOCX resume, or paste the resume text.');
      return;
    }

    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    } else {
      formData.append('resume_text', resumeText);
    }

    if (jobDescription.trim()) {
      formData.append('job_description', jobDescription);
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/ml/resume', {
        method: 'POST',
        body: formData,
      });

      const body = await response.json().catch(() => null) as
        | (ResumeReport & ErrorBody)
        | null;

      if (!response.ok || !body || !body.ats) {
        setError(
          body?.message ??
          'The resume service did not return an analysis. Try again shortly.'
        );
        return;
      }

      setReport(body);
    } catch {
      setError('Could not reach the resume service. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetAnalysis() {
    setFile(null);
    setResumeText('');
    setJobDescription('');
    setReport(null);
    setError(null);
  }

  return (
    <div className="space-y-7">

      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-7 text-white shadow-xl md:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2 text-violet-200">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              CareerMind AI
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Resume Intelligence
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Analyse your resume, identify skills, check ATS compatibility
            and compare your profile with a job description.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Upload your original PDF or DOCX file, or paste resume text.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <Label htmlFor="resume-file">Resume File (PDF / DOCX)</Label>
              <Input
                id="resume-file"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size: 10 MB
              </p>
            </div>

            {file && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="break-all text-sm font-semibold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB · Original file selected
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="resume-text">Or Paste Resume Text</Label>
              <Textarea
                id="resume-text"
                rows={6}
                disabled={file !== null}
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
                placeholder="Paste your complete resume text here..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">
                Job Description (Optional)
              </Label>
              <Textarea
                id="job-description"
                rows={5}
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job description to compare your resume..."
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Analysing Resume...' : 'Analyse Resume'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={resetAnalysis}
                disabled={submitting}
              >
                Reset
              </Button>
            </div>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {report && (
        <div className="space-y-6">

          {/* Result Heading */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Analysis Complete
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Resume Performance Report
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Results returned by your configured ML service.
              </p>
            </div>

            <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="mr-1 inline h-4 w-4" />
              Analysis completed
            </span>
          </div>

          {/* Original Resume */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Original Resume
              </CardTitle>
              <CardDescription>
                Your uploaded document. The original file is also saved by the API in your Resume Library.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {file && originalUrl ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText className="h-9 w-9 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="break-all font-semibold">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.type || file.name.split('.').pop()?.toUpperCase()} ·{' '}
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <a
                      href={originalUrl}
                      download={file.name}
                      className="inline-flex h-9 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
                    >
                      <FileDown className="h-4 w-4" />
                      Download Original
                    </a>
                  </div>

                  {file.name.toLowerCase().endsWith('.pdf') ? (
                    <div className="overflow-hidden rounded-xl border bg-muted/20">
                      <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-medium">
                        <Eye className="h-4 w-4" />
                        PDF Preview
                      </div>
                      <iframe
                        src={originalUrl}
                        title="Original resume PDF preview"
                        className="h-[650px] w-full"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed p-8 text-center">
                      <FileText className="mx-auto h-12 w-12 text-primary" />
                      <p className="mt-3 font-semibold">DOCX document uploaded</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Download the original DOCX file to view its full formatting.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                  Text-based resume submitted. No original PDF/DOCX file was uploaded.
                </div>
              )}
            </CardContent>
          </Card>

          {/* ATS Score and Stats */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="md:col-span-2">
              <CardContent className="flex flex-wrap items-center gap-6 p-6">
                <div
                  className="grid h-32 w-32 shrink-0 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#8b5cf6 ${scorePercentage}%, #e5e7eb ${scorePercentage}% 100%)`,
                  }}
                >
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-background">
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {scorePercentage.toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">ATS Score</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">ATS Checklist Score</p>
                  <p className="mt-1 text-2xl font-bold">
                    {report.ats.score} / {report.ats.max_score}
                  </p>
                  <p className="mt-2 font-medium text-primary">{scoreLabel}</p>
                  <p className="mt-2 max-w-xs text-xs text-muted-foreground">
                    {report.ats.method}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Skills Identified</p>
                <p className="mt-2 text-3xl font-bold">{report.skills.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">From analysis result</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Resume Word Count</p>
                <p className="mt-2 text-3xl font-bold">{report.word_count}</p>
                <p className="mt-1 text-xs text-muted-foreground">Words detected</p>
              </CardContent>
            </Card>
          </div>

          {/* Candidate Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Identified Contact Details</CardTitle>
              <CardDescription>
                Email and phone are matched from the extracted resume text. They are not guessed.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <Mail className="h-5 w-5 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="break-all text-sm font-medium">
                    {contacts.email || 'Not identified in extracted text'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border p-4">
                <Phone className="h-5 w-5 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">
                    {contacts.phone || 'Not identified in extracted text'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>AI Identified Skills</CardTitle>
              <CardDescription>
                Skills returned by the resume analysis service.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {report.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-700 dark:text-violet-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No skills from the configured taxonomy were identified.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Experience and Sections */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {report.experience.years_estimated === null
                    ? 'Not identified'
                    : `${report.experience.years_estimated} years`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Estimated experience returned by the analysis service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Resume Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.sections_found.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {report.sections_found.map((section, index) => (
                      <span
                        key={`${section}-${index}`}
                        className="rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No sections were identified.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ATS Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>ATS Checklist</CardTitle>
              <CardDescription>
                Individual checks returned by your ML service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.ats.checks.map((check) => (
                <div key={check.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {check.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <p className="font-medium">{check.label}</p>
                    </div>

                    <p className="text-sm font-semibold tabular-nums">
                      {check.points_awarded} / {check.max_points}
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${
                          check.max_points > 0
                            ? Math.min(100, Math.max(0, (check.points_awarded / check.max_points) * 100))
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {check.explanation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Job Match */}
          {report.job_match && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Job Match Analysis
                </CardTitle>
                <CardDescription>
                  Comparison against the job description you submitted.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="font-medium">Job Match Similarity</span>
                    <span className="font-bold">
                      {(report.job_match.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, report.job_match.similarity * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="mb-3 font-semibold text-emerald-700 dark:text-emerald-400">
                      Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.job_match.matched_skills.length > 0
                        ? report.job_match.matched_skills.map((skill, index) => (
                            <span key={`${skill}-${index}`} className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm">
                              {skill}
                            </span>
                          ))
                        : <span className="text-sm text-muted-foreground">None identified</span>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="mb-3 font-semibold text-amber-700 dark:text-amber-400">
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.job_match.missing_skills.length > 0
                        ? report.job_match.missing_skills.map((skill, index) => (
                            <span key={`${skill}-${index}`} className="rounded-full bg-amber-500/10 px-3 py-1 text-sm">
                              {skill}
                            </span>
                          ))
                        : <span className="text-sm text-muted-foreground">None identified</span>}
                    </div>
                  </div>
                </div>

                {report.job_match.keyword_gaps.length > 0 && (
                  <div>
                    <p className="mb-2 font-semibold">Keyword Gaps</p>
                    <div className="flex flex-wrap gap-2">
                      {report.job_match.keyword_gaps.map((keyword, index) => (
                        <span key={`${keyword}-${index}`} className="rounded-full border px-3 py-1 text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Extracted Text */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Resume Text</CardTitle>
              <CardDescription>
                Actual text extracted from your uploaded document or submitted text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {extractedText ? (
                <Textarea
                  readOnly
                  value={extractedText}
                  rows={14}
                  className="font-mono text-xs leading-6"
                />
              ) : (
                <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                  The analysis service did not return extracted text.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
