//middleware.ts
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const secret = process.env.NEXTAUTH_SECRET

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret })
  const { pathname } = req.nextUrl

  // Allow requests to NextAuth.js, public pages, and static files
  if (
    pathname.includes("/api/auth") ||
    pathname.includes("/static") ||
    pathname === "/auth"
  ) {
    return NextResponse.next()
  }

  // Redirect to /auth if not authenticated
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Specify the paths you want to protect
export const config = {
  matcher: ["/search/:path*", "/dashboard/:path*"],
}
