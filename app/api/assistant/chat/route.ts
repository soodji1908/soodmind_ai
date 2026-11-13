import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/services/session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ message: 'Please sign in to use the AI assistant.' }, { status: 401 });

  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ message: 'AI assistant is not configured. Add AI_API_KEY to .env.local and restart the server.' }, { status: 503 });

  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? body.messages.slice(-12) : [];
  if (!messages.length || messages.some((m: any) => !['user', 'assistant'].includes(m?.role) || typeof m?.content !== 'string' || m.content.length > 4000)) {
    return NextResponse.json({ message: 'Send a valid message (maximum 4,000 characters).' }, { status: 422 });
  }

  const endpoint = (process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions').replace(/\/$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, temperature: 0.3, messages: [
        { role: 'system', content: `You are EstateMind's helpful real-estate, career and recruiting platform assistant. The signed-in user's portal is ${session.portal}. Give practical, accurate answers. Never claim to have read private database records unless they are explicitly included in the conversation. Do not invent property listings, prices, market statistics, job vacancies or account activity. Explain when live data or external integration is required.` },
        ...messages,
      ] }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ message: data?.error?.message || 'AI provider request failed. Check your AI provider settings.' }, { status: 502 });
    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) return NextResponse.json({ message: 'The AI provider returned an empty response.' }, { status: 502 });
    return NextResponse.json({ ok: true, answer: answer.trim() });
  } catch (error) {
    console.error('[assistant/chat]', error);
    return NextResponse.json({ message: 'Could not reach the AI provider. Check AI_API_URL and your network connection.' }, { status: 502 });
  }
}
