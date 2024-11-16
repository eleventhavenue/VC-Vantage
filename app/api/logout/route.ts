// app/api/logout/route.ts

import { NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST() { // Removed 'req: Request'
  const cookie = serialize('auth', '', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Expire the cookie immediately
  })

  return NextResponse.json({ success: true }, { headers: { 'Set-Cookie': cookie } })
}
