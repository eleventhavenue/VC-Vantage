// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;

if (!username || !password) {
  throw new Error('Missing BASIC_AUTH_USERNAME or BASIC_AUTH_PASSWORD environment variables');
}

const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  const { pathname } = req.nextUrl;

  // Allow access to NextAuth.js API routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/static')) {
    return NextResponse.next();
  }

  // Allow access to Next.js internals and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // If Authorization header matches, proceed
  if (authHeader === basicAuth) {
    return NextResponse.next();
  }

  // Otherwise, prompt for credentials
  const response = new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
  return response;
}

export const config = {
  matcher: ['/((?!api/auth|api/static|api/_next|api/favicon.ico|api/static|_next|favicon.ico|static).*)'],
};
