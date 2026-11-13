import { NextResponse } from 'next/server';
import { z } from 'zod';
import { resolvePortalAccess } from '@/lib/auth/access';
import { callMlService } from '@/lib/ml/client';

const predictSchema = z.object({
  area_sqft: z.number().gt(50).max(100000),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  year_built: z.number().int().min(1800).max(new Date().getFullYear() + 1).nullable().optional(),
  lot_size_sqft: z.number().min(0).max(10000000).nullable().optional(),
  garage_spaces: z.number().int().min(0).max(10).nullable().optional(),
  location: z.string().trim().max(100).optional(),
  property_type: z.string().trim().max(50).optional(),
});

export async function POST(request: Request) {
  const access = await resolvePortalAccess('estate');
  if (!access) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Sign in to EstateMind to request price estimates.' },
      { status: 403 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = predictSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', message: parsed.error.issues[0]?.message ?? 'Check the property details and try again.' },
      { status: 422 },
    );
  }

  const result = await callMlService<Record<string, unknown>>('/api/ml/house-price/predict', {
    method: 'POST',
    json: parsed.data,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error, message: result.message }, { status: result.status });
  }

  try {
    const { connectDB } = await import('@/lib/mongodb');
    const { PropertyPrediction } = await import('@/lib/models/PropertyPrediction');
    await connectDB();
    await PropertyPrediction.create({
      userId: access.userId,
      input: parsed.data,
      prediction: result.data,
    });
  } catch {
    // logging is best-effort
  }

  return NextResponse.json(result.data);
}
