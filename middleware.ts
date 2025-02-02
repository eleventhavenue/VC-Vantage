// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Retrieve environment variables for Basic Auth
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME;
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

// Ensure that username and password are defined
if (!BASIC_AUTH_USERNAME || !BASIC_AUTH_PASSWORD) {
  throw new Error('Missing BASIC_AUTH_USERNAME or BASIC_AUTH_PASSWORD environment variables');
}

// Function to encode credentials to Base64
function encodeBasicAuth(username: string, password: string): string {
  // Edge Runtime does not support Buffer, so use TextEncoder
  const credentials = `${username}:${password}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(credentials);
  let base64 = '';
  data.forEach((byte) => {
    base64 += String.fromCharCode(byte);
  });
  // Convert binary string to base64
  return 'Basic ' + btoa(base64);
}

// Encode the credentials
const BASIC_AUTH = encodeBasicAuth(BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD);

// Define paths to exclude from Basic Auth
const excludedPaths = [
  /^\/$/,                                   // Exclude the homepage
  /^\/reports\/CSTAINABLE(?:\/|$)/i,        // Exclude /reports/CSTAINABLE and its subpaths
  /^\/api\/auth\/.*/,                       // Exclude all auth API routes
  /^\/api\/signup(?:\/|$)/i,                // Exclude /api/signup and its subpaths
  /^\/_next\/.*/,                           // Exclude Next.js internal routes
  /^\/favicon\.ico$/,                       // Exclude favicon
  /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,     // Exclude all image files
  /\.(css|js|json|map)$/i,                   // Exclude CSS, JS, JSON, and source maps
  // Add more patterns if needed
];

// Middleware function
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') || '';

  // **Part 1: Redirect Vercel Preview URLs to Production Domain**
  if (host.includes('.vercel.app') && !host.includes('www.vc-vantage.com')) {
    // Redirect to production domain
    const url = req.nextUrl.clone();
    url.host = 'www.vc-vantage.com'; // Change to 'vc-vantage.com' if you prefer
    console.log(`Redirecting to production domain: ${url.href}`);
    return NextResponse.redirect(url);
  }

  // **Part 2: Enforce Basic Authentication**
  // Check if the request path is excluded
  const isExcluded = excludedPaths.some((regex) => regex.test(pathname));

  console.log(`Requested Path: ${pathname}`);
  console.log(`Is path excluded: ${isExcluded}`);

  if (isExcluded) {
    return NextResponse.next();
  }

  // Get the Authorization header
  const authHeader = req.headers.get('authorization');
  console.log(`Authorization Header: ${authHeader}`);

  // If Authorization header matches, allow the request
  if (authHeader === BASIC_AUTH) {
    return NextResponse.next();
  }

  // Otherwise, return a 401 response prompting for credentials
  console.log('Authentication required. Sending 401 response.');
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// Updated config with proper matcher pattern
export const config = {
  matcher: '/:path*',
};
