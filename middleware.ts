import { NextResponse, type NextRequest } from 'next/server';

// Keep middleware Edge-safe: do not import jsonwebtoken, bcrypt, mongoose or
// Node crypto here. The signed token and MongoDB session are verified by the
// server-side portal layout before protected content is rendered.
const SESSION_COOKIE = 'em_session';
const PUBLIC_PORTAL_PAGES = new Set(['login', 'signup', 'forgot-password', 'reset-password']);
const PORTAL_SEGMENTS = new Set(['estate', 'career', 'recruiter', 'admin']);

export function middleware(request: NextRequest) {
  const [, portal, page] = request.nextUrl.pathname.split('/');
  const isProtectedPortalPage = PORTAL_SEGMENTS.has(portal) && Boolean(page) && !PUBLIC_PORTAL_PAGES.has(page);

  if (isProtectedPortalPage && !request.cookies.get(SESSION_COOKIE)?.value) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${portal}/login`;
    loginUrl.searchParams.set('error', 'session-expired');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/estate/:path*', '/career/:path*', '/recruiter/:path*', '/admin/:path*'],
};
