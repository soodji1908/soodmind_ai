import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      message: 'EstateMind AI — Machine Learning API',
      status: 'online',
      endpoints: [
        'POST /api/ml/house-price/predict',
        'POST /api/ml/resume/analyze',
        'POST /api/ml/resume/match',
      ],
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
