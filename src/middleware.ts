import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    const isAdminRoute = pathname.startsWith('/admin');
    const isAdminApiRoute = pathname.startsWith('/api/admin');

    if (isAdminRoute || isAdminApiRoute) {
      if (!token) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const role = token.role as string | undefined;
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        if (isAdminApiRoute) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
