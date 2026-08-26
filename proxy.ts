import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware — session refresh + basic route protection.
 * Runs on every non-static request.
 *
 * IMPORTANT: This does NOT replace server-side requireAuth() calls.
 * It only ensures Supabase sessions are refreshed so cookies stay valid.
 * Authentication validation is done in server components via getCurrentUser().
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const isProtectedPath =
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/round1') ||
    url.pathname.startsWith('/round2') ||
    url.pathname.startsWith('/reports') ||
    url.pathname.startsWith('/api/admin');

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes('auth-token') || c.name.startsWith('sb-')
  );

  // Fast path 1: Unprotected path without auth cookies -> zero overhead
  if (!isProtectedPath && !hasAuthCookie) {
    return NextResponse.next({ request });
  }

  // Fast path 2: Protected path without any auth cookie -> immediate redirect without contacting DB
  if (isProtectedPath && !hasAuthCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Skip session refresh for auth callback to avoid interference
  if (url.pathname === '/auth/callback') {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session to keep cookies valid - server components will call getUser() for auth validation
  await supabase.auth.refreshSession();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
