import { PORTALS, type PortalKey } from '@/lib/auth/portals';
import { AuthShell } from './auth-shell';
import { LoginForm } from './login-form';

export function LoginPage({ portal, errorCode }: { portal: PortalKey; errorCode?: string }) {
  const isAdmin = portal === 'admin';

  return (
    <AuthShell
      portal={portal}
      title={isAdmin ? 'Administrator sign in' : 'Welcome back'}
      subtitle={
        isAdmin
          ? 'Restricted to Super Administrators. Access is granted by the platform owner only.'
          : `Sign in to your ${PORTALS[portal].name} workspace.`
      }
      footer={
        isAdmin ? null : (
          <div className="flex flex-col gap-2">
            <p>
              New here?{' '}
              <a href={`${PORTALS[portal].basePath}/signup`} className="font-medium text-foreground underline-offset-4 hover:underline">
                Create an account
              </a>
            </p>
          </div>
        )
      }
    >
      <LoginForm portal={portal} errorCode={errorCode} />
    </AuthShell>
  );
}
