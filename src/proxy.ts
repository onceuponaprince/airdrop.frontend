import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface AuthMeResponse {
  isStaff?: boolean;
}

function buildApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL;
  if (configured && configured.length > 0) {
    return configured.replace(/\/$/, '');
  }
  return 'http://localhost:8000/api/v1';
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const apiBase = buildApiBaseUrl();

  try {
    const response = await fetch(`${apiBase}/auth/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    // Fail closed for admin pages if role check cannot complete.
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
