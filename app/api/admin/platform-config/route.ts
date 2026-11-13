import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getSessionFromCookies } from '@/lib/services/session';
import { resolvePortalAccess } from '@/lib/auth/access';
import { PlatformSettings, AuditLog } from '@/lib/models';

const DEFAULTS = {
  brandName: 'EstateMind',
  supportEmail: '',
  supportPhone: '',
  defaultCurrency: 'INR',
  defaultCountry: 'IN',
  maintenanceMode: false,
  allowPublicSignup: true,
  requireEmailVerification: false,
  allowPropertyListings: true,
  allowPropertyEnquiries: true,
  allowAppointments: true,
  allowPayments: false,
  allowSubscriptions: true,
  allowAgentRegistration: true,
  enableGoogleMaps: true,
  mapDefaultCity: 'Ludhiana, Punjab, India',
  mapZoom: 12,
  featuredListingsLimit: 12,
  maxImagesPerListing: 20,
  platformAnnouncement: '',
  termsUrl: '',
  privacyUrl: '',
};
const ALLOWED = new Set(Object.keys(DEFAULTS));

async function adminContext() {
  const session = await getSessionFromCookies();
  if (!session) return { response: NextResponse.json({ message: 'Authentication required.' }, { status: 401 }) };
  const access = await resolvePortalAccess('admin');
  if (!access || access.userId !== session.userId) return { response: NextResponse.json({ message: 'Super admin permission required.' }, { status: 403 }) };
  await connectDB();
  return { userId: session.userId };
}

export async function GET() {
  try {
    const auth = await adminContext();
    if ('response' in auth) return auth.response;
    const rows = await PlatformSettings.find({ key: { $in: Array.from(ALLOWED) } }).lean();
    const settings: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) settings[row.key] = row.value;
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error('[admin:platform-config:get]', error);
    return NextResponse.json({ message: 'Could not load platform settings.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await adminContext();
    if ('response' in auth) return auth.response;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ message: 'Invalid settings payload.' }, { status: 422 });
    const updates = Object.entries(body).filter(([key]) => ALLOWED.has(key));
    if (!updates.length) return NextResponse.json({ message: 'No supported settings were provided.' }, { status: 422 });
    for (const [key, value] of updates) {
      const defaultValue = DEFAULTS[key as keyof typeof DEFAULTS];
      if (typeof value !== typeof defaultValue) return NextResponse.json({ message: `Invalid value for ${key}.` }, { status: 422 });
      if (typeof value === 'string' && value.length > 1000) return NextResponse.json({ message: `${key} is too long.` }, { status: 422 });
      if (key === 'mapZoom' && (Number(value) < 1 || Number(value) > 20)) return NextResponse.json({ message: 'Map zoom must be between 1 and 20.' }, { status: 422 });
      if (key === 'featuredListingsLimit' && (Number(value) < 1 || Number(value) > 100)) return NextResponse.json({ message: 'Featured listings limit must be between 1 and 100.' }, { status: 422 });
      if (key === 'maxImagesPerListing' && (Number(value) < 1 || Number(value) > 100)) return NextResponse.json({ message: 'Image limit must be between 1 and 100.' }, { status: 422 });
      await PlatformSettings.findOneAndUpdate({ key }, { $set: { value, updatedBy: auth.userId, description: 'Managed from Platform Owner Control Center' } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    await AuditLog.create({ actorId: auth.userId, action: 'platform.settings.updated', entityType: 'PlatformSettings', metadata: { keys: updates.map(([key]) => key) } });
    return NextResponse.json({ ok: true, message: 'Platform settings saved.' });
  } catch (error) {
    console.error('[admin:platform-config:put]', error);
    return NextResponse.json({ message: 'Could not save platform settings.' }, { status: 500 });
  }
}
