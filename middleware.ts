// middleware.ts

import { NextRequest, NextResponse } from 'next/server';

// Retrieve environment variables
const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;

// Ensure that username and password are defined
if (!username || !password) {
  throw new Error('Missing BASIC_AUTH_USERNAME or BASIC_AUTH_PASSWORD environment variables');
}

// Encode the credentials in Base64
const basicAuth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

export function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  // Allow requests to the API routes and static files without authentication
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // If the Authorization header matches the stored credentials, proceed
  if (authHeader === basicAuth) {
    return NextResponse.next();
  }

  // Otherwise, return a 401 response prompting for credentials
  const response = new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
  return response;
}

// Specify the paths where the middleware should run
export const config = {
  matcher: ['/((?!api|_next|favicon.ico|static).*)'],
};
