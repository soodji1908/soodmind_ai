import { redirect } from 'next/navigation';
import { resolvePortalAccess, type PortalAccess } from './access';
import { PORTALS, type PortalKey } from './portals';
import { getPlatformSetting } from '@/lib/platform-settings';

export async function requirePortalAccess(
  portal: PortalKey,
): Promise<{ access: PortalAccess }> {
  const access = await resolvePortalAccess(portal);

  if (!access) {
    redirect(`${PORTALS[portal].loginPath}?error=no-access`);
  }

  if (portal !== 'admin' && await getPlatformSetting<boolean>('maintenanceMode', false)) redirect('/maintenance');

  return { access };
}
