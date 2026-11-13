const DEFAULT_ML_API_URL = 'http://localhost:8000';
const ML_REQUEST_TIMEOUT_MS = 30_000;

export type MlSuccess<T> = { ok: true; status: number; data: T };
export type MlFailure = { ok: false; status: number; error: string; message: string };
export type MlResult<T> = MlSuccess<T> | MlFailure;

type JsonRequest = { method: 'POST'; json: unknown };
type FormRequest = { method: 'POST'; form: FormData };

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export async function callMlService<T>(path: string, request: JsonRequest | FormRequest): Promise<MlResult<T>> {
  const apiKey = process.env.ML_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: 'not_configured',
      message: 'ML_API_KEY is missing from the Next.js environment. Add the same ML_API_KEY to the project root .env.local and python-ml service environment, then restart both servers.',
    };
  }

  const configuredUrl = process.env.ML_API_URL?.trim();
  const baseUrl = (configuredUrl || DEFAULT_ML_API_URL).replace(/\/$/, '');
  const headers: Record<string, string> = { 'X-ML-API-Key': apiKey };
  let body: string | FormData;
  if ('json' in request) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(request.json);
  } else {
    body = request.form;
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(ML_REQUEST_TIMEOUT_MS),
    });
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const record = (payload ?? {}) as Record<string, unknown>;
      return {
        ok: false,
        status: response.status,
        error: readString(record.error, 'ml_error'),
        message: readString(record.message, 'The machine learning service could not complete this request.'),
      };
    }

    if (payload === null || typeof payload !== 'object') {
      return {
        ok: false,
        status: 502,
        error: 'invalid_response',
        message: 'The machine learning service returned an unexpected response.',
      };
    }

    return { ok: true, status: response.status, data: payload as T };
  } catch {
    return {
      ok: false,
      status: 503,
      error: 'unreachable',
      message: 'The machine learning service is not reachable. Start the Python server and try again.',
    };
  }
}
