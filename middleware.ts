// middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow the login page and login API route without authentication
  if (pathname.startsWith('/login') || pathname.startsWith('/api/login')) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // e.g., .css, .js, .png
  ) {
    return NextResponse.next()
  }

  // Check for the auth cookie
  const auth = req.cookies.get('auth')?.value

  if (auth !== 'authenticated') {
    // Redirect to login page
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - /login
     * - /api/login
     * - /_next/
     * - any routes containing a dot (static files)
     */
    '/((?!login|api/login|_next|.*\\..*).*)',
  ],
}
