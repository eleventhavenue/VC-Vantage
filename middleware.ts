// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host');

  // Detect if the request is coming from a Vercel preview deployment
  if (host && host.includes('.vercel.app') && !host.includes('www.vc-vantage.com')) {
    // Redirect to the production domain
    const url = req.nextUrl.clone();
    url.host = 'vc-vantage.com'; // or 'www.vc-vantage.com' based on your preference
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*', '/auth/:path*'], // Adjust paths as needed
};
