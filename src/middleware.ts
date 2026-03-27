import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';

function buildApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured && configured.length > 0) {
    return configured.replace(/\/$/, '');
  }
  return 'http://localhost:8000/api/v1';
}

/** App-shell routes: require an auth cookie (JWT mirrored from client; see useWeb3Auth). */
const PROTECTED_APP_PREFIXES = [
  '/dashboard',
  '/settings',
  '/onboarding',
  '/spore-lab',
  '/loot',
  '/skill-tree',
  '/observability',
  '/quests',
  '/notifications',
  '/referrals',
  '/leaderboard',
];

function isProtectedAppPath(pathname: string): boolean {
  return PROTECTED_APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

interface AuthMeResponse {
  isStaff?: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (isAdminPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const apiBase = buildApiBaseUrl();
    try {
      const response = await fetch(`${apiBase}/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });

      if (response.status === 401) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (!response.ok) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      const payload = (await response.json()) as AuthMeResponse;
      if (!payload.isStaff) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (isProtectedAppPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/spore-lab/:path*',
    '/loot/:path*',
    '/skill-tree/:path*',
    '/observability/:path*',
    '/quests/:path*',
    '/notifications/:path*',
    '/referrals/:path*',
    '/leaderboard/:path*',
    '/admin/:path*',
  ],
};
