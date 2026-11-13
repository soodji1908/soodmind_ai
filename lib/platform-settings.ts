import { PlatformSettings } from '@/lib/models/PlatformSettings';
const FALLBACKS: Record<string, unknown> = { allowPublicSignup: true, allowPropertyListings: true, allowPropertyEnquiries: true, allowAppointments: true, maintenanceMode: false, enableGoogleMaps: true };
export async function getPlatformSetting<T = unknown>(key: string, fallback?: T): Promise<T> {
  try {
    const setting = await PlatformSettings.findOne({ key }).select('value').lean();
    if (setting) return setting.value as T;
  } catch (error) {
    console.error(`[platform-setting:${key}]`, error);
  }
  return (fallback !== undefined ? fallback : FALLBACKS[key]) as T;
}
